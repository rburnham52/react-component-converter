import type { MitosisNode } from '@builder.io/mitosis';
import type { ExtendedMitosisComponent, SvelteCompilerOptions, PropDefinition } from '@react-component-converter/core';

/**
 * Generates the template section for a Svelte component.
 * Converts Mitosis nodes to Svelte template syntax.
 */
export function generateSvelteTemplate(
  component: ExtendedMitosisComponent,
  options: SvelteCompilerOptions = {},
  props: PropDefinition[] = []
): string {
  const reactMeta = component.meta.reactMeta;

  // Check for state props that need data-state attributes
  const stateProps = props.filter(p => p.isStateProp && p.dataStateValues);

  // If we have children nodes from Mitosis, convert them
  if (component.children && component.children.length > 0) {
    return component.children
      .map(child => convertNodeToSvelte(child, reactMeta, 0, stateProps))
      .join('\n');
  }

  // Fallback: generate a simple template based on forwardRef info
  return generateFallbackTemplate(component, reactMeta, props);
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
 * Converts a Mitosis node to Svelte template syntax.
 */
function convertNodeToSvelte(
  node: MitosisNode,
  reactMeta: ExtendedMitosisComponent['meta']['reactMeta'],
  depth: number = 0,
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
      ?.map((child, idx) => convertNodeToSvelte(child, reactMeta, depth, stateProps, idx === 0))
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
  // Svelte 5 requires explicit closing tags for non-void elements
  const noSlotElements = ['textarea', 'select'];
  if (noSlotElements.includes(tagName)) {
    return `${indent}<${tagName}${attributes}></${tagName}>`;
  }

  // Handle children - children are never root elements
  const childrenContent = node.children
    ?.map(child => convertNodeToSvelte(child, reactMeta, depth + 1, stateProps, false))
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
    innerContent = `\n${indent}  {@render children?.()}\n${indent}`;
  } else if (hasSpreadProps && !childrenContent) {
    // If spread props are used and no explicit children, add slot for children
    innerContent = `\n${indent}  {@render children?.()}\n${indent}`;
  } else if (childrenContent) {
    innerContent = `\n${childrenContent}\n${indent}`;
  }

  return `${indent}<${tagName}${attributes}>${innerContent}</${tagName}>`;
}

/**
 * Converts Mitosis bindings to Svelte attributes.
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
      attrs.push(`class={${classCode}}`);
    } else if (name === 'ref') {
      // Convert ref to bind:this
      const refName = code.replace('props.', '').replace('state.', '');
      attrs.push(`bind:this={${refName}}`);
    } else if (name.startsWith('on')) {
      // Convert event handlers
      const eventName = name.slice(2).toLowerCase();
      const handlerCode = convertEventHandler(code);
      attrs.push(`on${eventName}={${handlerCode}}`);
    } else if (name === 'spread' || name === '...') {
      // Handle spread props
      attrs.push(`{...restProps}`);
    } else {
      // Regular binding
      const attrName = convertAttrName(name);
      const bindingCode = convertBindingCode(code);
      attrs.push(`${attrName}={${bindingCode}}`);
    }
  }

  // Add spread props if the node has them
  if ((node as any).spreadProps || hasSpreadInBindings(node)) {
    if (!attrs.some(a => a.includes('...restProps'))) {
      attrs.push(`{...restProps}`);
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
        attrs.push(`aria-checked={checked}`);
      }
      if (!attrs.some(a => a.includes('data-state'))) {
        attrs.push(`data-state={dataState}`);
      }
      if (!attrs.some(a => a.includes('disabled'))) {
        attrs.push(`{disabled}`);
      }
      if (!attrs.some(a => a.includes('onclick'))) {
        attrs.push(`onclick={toggle}`);
      }
    }
  }

  // For child elements that use data-[state=*] in their class, add only data-state
  if (needsDataStateOnly && !attrs.some(a => a.includes('data-state'))) {
    attrs.push(`data-state={dataState}`);
  }

  return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
}

/**
 * Converts className binding to Svelte class binding.
 */
function convertClassBinding(code: string, reactMeta: ExtendedMitosisComponent['meta']['reactMeta']): string {
  // Remove props. prefix
  let result = code.replace(/props\./g, '');

  // Handle cn() calls - keep as-is but fix className -> class
  result = result.replace(/className/g, 'className');

  // Handle buttonVariants or similar CVA calls
  if (reactMeta?.cva) {
    const cvaName = reactMeta.cva.name;
    // Ensure the CVA function call uses the right variable names
    result = result.replace(
      new RegExp(`${cvaName}\\(\\{([^}]+)\\}\\)`, 'g'),
      (match, args) => {
        // Convert props.variant to variant, etc.
        const cleanArgs = args.replace(/props\./g, '');
        return `${cvaName}({ ${cleanArgs} })`;
      }
    );
  }

  return result;
}

/**
 * Converts event handler code for Svelte.
 */
function convertEventHandler(code: string): string {
  // Remove props. prefix
  let result = code.replace(/props\./g, '');

  // Convert arrow functions
  if (result.includes('=>')) {
    return result;
  }

  // Convert function references
  return result;
}

/**
 * Converts general binding code for Svelte.
 */
function convertBindingCode(code: string): string {
  // Remove props. prefix
  let result = code.replace(/props\./g, '');

  // Remove state. prefix
  result = result.replace(/state\./g, '');

  return result;
}

/**
 * Converts React attribute names to Svelte attribute names.
 */
function convertAttrName(name: string): string {
  const mapping: Record<string, string> = {
    className: 'class',
    htmlFor: 'for',
    tabIndex: 'tabindex',
    autoFocus: 'autofocus',
    autoComplete: 'autocomplete',
    // Event handlers are lowercase in Svelte
    onClick: 'onclick',
    onChange: 'onchange',
    onInput: 'oninput',
    onBlur: 'onblur',
    onFocus: 'onfocus',
    onSubmit: 'onsubmit',
    onKeyDown: 'onkeydown',
    onKeyUp: 'onkeyup',
    onKeyPress: 'onkeypress',
    onMouseDown: 'onmousedown',
    onMouseUp: 'onmouseup',
    onMouseEnter: 'onmouseenter',
    onMouseLeave: 'onmouseleave',
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

  // Get base classes from component metadata
  const baseClasses = (component.meta as any).baseClasses;

  // Build class attribute
  let classAttr = '';
  if (reactMeta?.cva) {
    // Build CVA args from actual variant names
    const variantArgs = Object.keys(reactMeta.cva.variants).join(', ');
    classAttr = ` class={cn(${reactMeta.cva.name}({ ${variantArgs} }), className)}`;
  } else if (reactMeta?.usesCn && baseClasses) {
    classAttr = ` class={cn("${baseClasses}", className)}`;
  } else if (baseClasses) {
    classAttr = ` class={cn("${baseClasses}", className)}`;
  } else if (reactMeta?.usesCn) {
    classAttr = ` class={cn(className)}`;
  } else {
    classAttr = ` class={className}`;
  }

  // Build ref binding
  let refAttr = '';
  if (reactMeta?.forwardRef) {
    refAttr = ` bind:this={${reactMeta.forwardRef.paramName}}`;
  }

  // Build state-related attributes (for Switch, Checkbox, Toggle, etc.)
  let stateAttrs = '';
  if (hasCheckedProp) {
    stateAttrs = ` aria-checked={checked} data-state={dataState} {disabled} onclick={toggle}`;
    // For button-like elements with checked state, add role="switch"
    if (elementTag === 'button') {
      stateAttrs = ` type="button" role="switch"${stateAttrs}`;
    }
  }

  // Generate template
  // Void elements (can't have children) - self-closing in Svelte
  const voidElements = ['input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
  // Elements that can have children but don't use slots (content comes from value/attribute)
  const noSlotElements = ['textarea', 'select'];

  if (voidElements.includes(elementTag)) {
    return `<${elementTag}${refAttr}${classAttr}${stateAttrs} {...restProps} />`;
  }

  if (noSlotElements.includes(elementTag)) {
    // textarea and select get their value from the value attribute, not children
    // Svelte 5 requires explicit closing tags for non-void elements
    return `<${elementTag}${refAttr}${classAttr}${stateAttrs} {...restProps}></${elementTag}>`;
  }

  return `<${elementTag}${refAttr}${classAttr}${stateAttrs} {...restProps}>
  {@render children?.()}
</${elementTag}>`;
}
