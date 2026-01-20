import type { MitosisNode } from '@builder.io/mitosis';
import type { ExtendedMitosisComponent, VueCompilerOptions, PropDefinition } from '@react-component-converter/core';

/**
 * Generates the <template> section for a Vue 3 component.
 * Converts Mitosis nodes to Vue template syntax.
 */
export function generateVueTemplate(
  component: ExtendedMitosisComponent,
  options: VueCompilerOptions = {},
  props: PropDefinition[] = []
): string {
  const reactMeta = component.meta.reactMeta;

  // Check for state props that need data-state attributes
  const stateProps = props.filter(p => p.isStateProp && p.dataStateValues);

  // If we have children nodes from Mitosis, convert them
  if (component.children && component.children.length > 0) {
    const content = component.children
      .map(child => convertNodeToVue(child, reactMeta, 1, stateProps))
      .join('\n');
    return `<template>\n${content}\n</template>`;
  }

  // Fallback: generate a simple template based on forwardRef info
  const fallbackContent = generateFallbackTemplate(component, reactMeta, props);
  return `<template>\n${fallbackContent}\n</template>`;
}

/**
 * Checks if a node's class uses data-state based styling.
 */
function nodeUsesDataStateInClass(node: MitosisNode): boolean {
  // Check static properties
  const staticClass = node.properties?.['className'] || node.properties?.['class'] || '';
  if (staticClass.includes('data-[state=')) {
    return true;
  }

  // Check bindings
  const classBinding = node.bindings?.['className']?.code || node.bindings?.['class']?.code || '';
  if (classBinding.includes('data-[state=')) {
    return true;
  }

  return false;
}

/**
 * Converts a Mitosis node to Vue template syntax.
 */
function convertNodeToVue(
  node: MitosisNode,
  reactMeta: ExtendedMitosisComponent['meta']['reactMeta'],
  depth: number = 1,
  stateProps: PropDefinition[] = [],
  isRoot: boolean = true
): string {
  const indent = '  '.repeat(depth);

  // Handle text nodes
  if (node.name === 'TextNode' || (node as any)['@type'] === '@builder.io/mitosis/text') {
    return `${indent}${(node as any).text || ''}`;
  }

  // Handle fragment
  if (node.name === 'Fragment' || node.name === '') {
    return node.children
      ?.map((child, idx) => convertNodeToVue(child, reactMeta, depth, stateProps, idx === 0))
      .join('\n') || '';
  }

  // Convert tag name (lowercase for HTML elements)
  const tagName = node.name.toLowerCase();

  // Determine if this element needs data-state:
  // - Root element gets full state props (role, aria-checked, onclick, etc.)
  // - Child elements only get data-state if their class uses data-[state=*]
  const needsDataStateOnly = !isRoot && nodeUsesDataStateInClass(node) && stateProps.some(p => p.name === 'checked');

  // Convert attributes - only pass stateProps for root element
  const attributes = convertAttributes(node, reactMeta, isRoot ? stateProps : [], needsDataStateOnly);

  // Handle void elements (can't have children)
  const voidElements = ['input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
  if (voidElements.includes(tagName)) {
    return `${indent}<${tagName}${attributes} />`;
  }

  // Handle elements that don't use slot-based children (textarea, select)
  const noSlotElements = ['textarea', 'select'];
  if (noSlotElements.includes(tagName)) {
    return `${indent}<${tagName}${attributes} />`;
  }

  // Handle children - children are never root elements
  const childrenContent = node.children
    ?.map(child => convertNodeToVue(child, reactMeta, depth + 1, stateProps, false))
    .join('\n') || '';

  // Check for slot/children rendering
  const hasChildrenSlot = Object.values(node.bindings || {}).some(
    binding => binding?.code?.includes('children') || binding?.code?.includes('props.children')
  );

  // Check if spread props are used (which includes children in React)
  // When {...props} is used, children come through that spread
  const hasSpreadProps = Object.entries(node.bindings || {}).some(
    ([key, binding]) => key === '...' || key === 'spread' || binding?.type === 'spread'
  );

  let innerContent = childrenContent;
  if (hasChildrenSlot || childrenContent.includes('{children}')) {
    innerContent = `\n${indent}  <slot />\n${indent}`;
  } else if (hasSpreadProps && !childrenContent) {
    // If spread props are used and no explicit children, add slot for children
    innerContent = `\n${indent}  <slot />\n${indent}`;
  } else if (childrenContent) {
    innerContent = `\n${childrenContent}\n${indent}`;
  }

  return `${indent}<${tagName}${attributes}>${innerContent}</${tagName}>`;
}

/**
 * Converts Mitosis bindings to Vue attributes.
 */
function convertAttributes(
  node: MitosisNode,
  reactMeta: ExtendedMitosisComponent['meta']['reactMeta'],
  stateProps: PropDefinition[] = [],
  needsDataStateOnly: boolean = false
): string {
  const attrs: string[] = [];

  // Handle static properties
  for (const [name, value] of Object.entries(node.properties || {})) {
    if (name === 'className' || name === 'class') {
      // Will be handled by bindings for dynamic classes
      if (!node.bindings?.class && !node.bindings?.className) {
        attrs.push(`class="${value}"`);
      }
    } else {
      attrs.push(`${convertAttrName(name)}="${value}"`);
    }
  }

  // Handle bindings (dynamic attributes)
  for (const [name, binding] of Object.entries(node.bindings || {})) {
    if (!binding?.code) continue;

    const code = binding.code;

    if (name === 'className' || name === 'class') {
      // Convert className binding
      const classCode = convertClassBinding(code, reactMeta);
      attrs.push(`:class="${classCode}"`);
    } else if (name === 'ref') {
      // Convert ref to Vue ref
      const refName = code.replace('props.', '').replace('state.', '');
      attrs.push(`ref="${refName}"`);
    } else if (name.startsWith('on')) {
      // Convert event handlers
      const eventName = name.slice(2).toLowerCase();
      const handlerCode = convertEventHandler(code);
      attrs.push(`@${eventName}="${handlerCode}"`);
    } else if (name === 'spread' || name === '...') {
      // Handle spread props
      attrs.push(`v-bind="$attrs"`);
    } else {
      // Regular binding
      const attrName = convertAttrName(name);
      const bindingCode = convertBindingCode(code);
      attrs.push(`:${attrName}="${bindingCode}"`);
    }
  }

  // Add v-bind="$attrs" if the node has spread props
  if ((node as any).spreadProps || hasSpreadInBindings(node)) {
    if (!attrs.some(a => a.includes('v-bind="$attrs"'))) {
      attrs.push(`v-bind="$attrs"`);
    }
  }

  // Add state prop bindings (e.g., data-state, aria-checked for Switch)
  // These are only added to the root element (stateProps will be empty for children)
  if (stateProps.length > 0) {
    const checkedProp = stateProps.find(p => p.name === 'checked');
    const hasDisabled = stateProps.some(p => p.name === 'disabled');

    if (checkedProp) {
      // Add type, role, aria-checked, data-state, disabled, and click handler
      if (!attrs.some(a => a.includes('type='))) {
        attrs.push(`type="button"`);
      }
      if (!attrs.some(a => a.includes('role='))) {
        attrs.push(`role="switch"`);
      }
      if (!attrs.some(a => a.includes('aria-checked'))) {
        attrs.push(`:aria-checked="checked"`);
      }
      if (!attrs.some(a => a.includes('data-state'))) {
        attrs.push(`:data-state="dataState"`);
      }
      if (!attrs.some(a => a.includes('disabled'))) {
        attrs.push(`:disabled="disabled"`);
      }
      if (!attrs.some(a => a.includes('@click'))) {
        attrs.push(`@click="toggle"`);
      }
    }
  }

  // For child elements that use data-[state=*] in their class, add only data-state
  if (needsDataStateOnly && !attrs.some(a => a.includes('data-state'))) {
    attrs.push(`:data-state="dataState"`);
  }

  return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
}

/**
 * Converts className binding to Vue class binding.
 */
function convertClassBinding(code: string, reactMeta: ExtendedMitosisComponent['meta']['reactMeta']): string {
  let result = code;

  // Convert double quotes to single quotes to avoid conflicts with Vue attribute quotes
  result = result.replace(/"/g, "'");

  // For cn() calls with CVA, ensure proper Vue syntax
  // cn(buttonVariants({ variant, size, className })) ->
  // cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)
  // Note: We remove className from the CVA call and pass it separately to cn()

  if (reactMeta?.cva) {
    const cvaName = reactMeta.cva.name;

    // Track if we found className in a CVA call (to add props.class to cn())
    let hadClassNameInCva = false;

    // Convert CVA function calls to use props. prefix, excluding className
    result = result.replace(
      new RegExp(`${cvaName}\\(\\{\\s*([^}]+)\\s*\\}\\)`, 'g'),
      (match, args) => {
        // Check if className is in the args
        const argList = args.split(',').map((a: string) => a.trim());
        const hasClassName = argList.some((arg: string) =>
          arg === 'className' || arg.startsWith('className:')
        );

        if (hasClassName) {
          hadClassNameInCva = true;
        }

        // Parse the arguments and add props. prefix where needed
        const convertedArgs = argList
          .map((trimmed: string) => {
            // Skip className - it will be handled separately via props.class
            if (trimmed === 'className' || trimmed.startsWith('className:')) {
              return null;
            }
            // Handle shorthand properties like { variant, size }
            if (!trimmed.includes(':')) {
              return `${trimmed}: props.${trimmed}`;
            }
            // Handle explicit properties like { variant: props.variant }
            return trimmed;
          })
          .filter(Boolean)
          .join(', ');
        return `${cvaName}({ ${convertedArgs} })`;
      }
    );

    // If className was found in CVA call, add props.class as second argument to cn()
    // cn(buttonVariants({ ... })) -> cn(buttonVariants({ ... }), props.class)
    if (hadClassNameInCva) {
      // Match cn(...) where ... contains the CVA call
      result = result.replace(
        new RegExp(`cn\\(${cvaName}\\(([^)]+)\\)\\)`, 'g'),
        `cn(${cvaName}($1), props.class)`
      );
    }
  }

  // Handle className -> props.class rename AFTER CVA conversion
  // First handle props.className -> props.class
  result = result.replace(/props\.className/g, 'props.class');

  // Handle standalone className (as a value, not as an object key) -> props.class
  // Match className when it's:
  // - At end of string or followed by ) or , or whitespace
  // - Not followed by : (which would make it an object key)
  result = result.replace(/\bclassName(?=\s*[,)\s]|$)/g, 'props.class');

  // Handle other prop references that need props. prefix
  // Only prefix identifiers that are used in comparisons (=== or !==)
  // E.g., orientation === 'horizontal' -> props.orientation === 'horizontal'
  // Be careful not to prefix things inside strings or data attributes
  const propIdentifiers = ['orientation', 'variant', 'size'];
  for (const prop of propIdentifiers) {
    // Match prop identifier followed by === or !== (comparison context)
    // This is more specific to avoid false positives in data attributes
    const comparisonRegex = new RegExp(`(?<!props\\.)\\b${prop}\\b(?=\\s*[!=]==)`, 'g');
    result = result.replace(comparisonRegex, `props.${prop}`);
  }

  return result;
}

/**
 * Converts event handler code for Vue.
 */
function convertEventHandler(code: string): string {
  // Remove props. prefix for simple handler references
  let result = code.replace(/props\./g, '');

  // Convert arrow functions to Vue format
  if (result.includes('=>')) {
    // Keep arrow functions as-is for Vue
    return result;
  }

  // Simple function reference
  return result;
}

/**
 * Converts general binding code for Vue.
 */
function convertBindingCode(code: string): string {
  // Keep props. prefix for Vue (accessed as props.xxx)
  let result = code;

  // Remove state. prefix
  result = result.replace(/state\./g, '');

  return result;
}

/**
 * Converts React attribute names to Vue attribute names.
 */
function convertAttrName(name: string): string {
  const mapping: Record<string, string> = {
    className: 'class',
    htmlFor: 'for',
    tabIndex: 'tabindex',
    autoFocus: 'autofocus',
    autoComplete: 'autocomplete',
  };

  return mapping[name] || name;
}

/**
 * Checks if a node has spread in its bindings.
 */
function hasSpreadInBindings(node: MitosisNode): boolean {
  const bindings = node.bindings || {};
  return Object.keys(bindings).some(key =>
    key === 'spread' || key === '...' || key.startsWith('...')
  );
}

/**
 * Generates a fallback template when Mitosis parsing provides minimal info.
 */
function generateFallbackTemplate(
  component: ExtendedMitosisComponent,
  reactMeta: ExtendedMitosisComponent['meta']['reactMeta'],
  props: PropDefinition[] = []
): string {
  // Get base classes from component metadata
  const baseClasses = (component.meta as any).baseClasses;

  // Check for state props (e.g., checked for Switch)
  const stateProps = props.filter(p => p.isStateProp && p.dataStateValues);
  const hasCheckedProp = stateProps.some(p => p.name === 'checked');
  const hasDisabledProp = props.some(p => p.name === 'disabled');

  // Determine element type from forwardRef
  let elementTag = 'div';
  if (reactMeta?.forwardRef) {
    const elementType = reactMeta.forwardRef.elementType;
    const tagMapping: Record<string, string> = {
      'HTMLButtonElement': 'button',
      'HTMLInputElement': 'input',
      'HTMLTextAreaElement': 'textarea',
      'HTMLSelectElement': 'select',
      'HTMLAnchorElement': 'a',
      'HTMLDivElement': 'div',
      'HTMLSpanElement': 'span',
      'HTMLFormElement': 'form',
      'HTMLImageElement': 'img',
      'HTMLParagraphElement': 'p',
      'HTMLHeadingElement': 'h5',
      'HTMLLabelElement': 'label',
    };
    elementTag = tagMapping[elementType] || 'div';
  }

  // Build class attribute
  let classAttr = '';
  if (reactMeta?.cva) {
    // Build CVA args from actual variant names
    const variantArgs = Object.keys(reactMeta.cva.variants)
      .map(v => `${v}: props.${v}`)
      .join(', ');
    classAttr = ` :class="cn(${reactMeta.cva.name}({ ${variantArgs} }), props.class)"`;
  } else if (reactMeta?.usesCn && baseClasses) {
    classAttr = ` :class="cn('${baseClasses}', props.class)"`;
  } else if (baseClasses) {
    classAttr = ` :class="cn('${baseClasses}', props.class)"`;
  } else if (reactMeta?.usesCn) {
    classAttr = ` :class="cn(props.class)"`;
  } else {
    classAttr = ` :class="props.class"`;
  }

  // Build ref attribute - use elementRef to avoid conflict with Vue's ref import
  let refAttr = '';
  if (reactMeta?.forwardRef) {
    const refVarName = reactMeta.forwardRef.paramName === 'ref' ? 'elementRef' : reactMeta.forwardRef.paramName;
    refAttr = ` ref="${refVarName}"`;
  }

  // Build state-related attributes (for Switch, Checkbox, Toggle, etc.)
  let stateAttrs = '';
  if (hasCheckedProp) {
    stateAttrs = ` :aria-checked="checked" :data-state="dataState" :disabled="disabled" @click="toggle"`;
    // For button-like elements with checked state, add role="switch"
    if (elementTag === 'button') {
      stateAttrs = ` type="button" role="switch"${stateAttrs}`;
    }
  }

  // Generate template
  // Void elements (can't have children)
  const voidElements = ['input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
  // Elements that can have children but don't use slots (content comes from value/attribute)
  const noSlotElements = ['textarea', 'select'];

  if (voidElements.includes(elementTag)) {
    return `  <${elementTag}${refAttr}${classAttr}${stateAttrs} v-bind="$attrs" />`;
  }

  if (noSlotElements.includes(elementTag)) {
    // textarea and select get their value from the value attribute, not slots
    return `  <${elementTag}${refAttr}${classAttr}${stateAttrs} v-bind="$attrs" />`;
  }

  return `  <${elementTag}${refAttr}${classAttr}${stateAttrs} v-bind="$attrs">
    <slot />
  </${elementTag}>`;
}
