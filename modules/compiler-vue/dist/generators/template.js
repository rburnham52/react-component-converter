/**
 * Generates the <template> section for a Vue 3 component.
 * Converts Mitosis nodes to Vue template syntax.
 */
export function generateVueTemplate(component, options = {}) {
    const reactMeta = component.meta.reactMeta;
    // If we have children nodes from Mitosis, convert them
    if (component.children && component.children.length > 0) {
        const content = component.children
            .map(child => convertNodeToVue(child, reactMeta))
            .join('\n');
        return `<template>\n${content}\n</template>`;
    }
    // Fallback: generate a simple template based on forwardRef info
    const fallbackContent = generateFallbackTemplate(component, reactMeta);
    return `<template>\n${fallbackContent}\n</template>`;
}
/**
 * Converts a Mitosis node to Vue template syntax.
 */
function convertNodeToVue(node, reactMeta, depth = 1) {
    const indent = '  '.repeat(depth);
    // Handle text nodes
    if (node.name === 'TextNode' || node['@type'] === '@builder.io/mitosis/text') {
        return `${indent}${node.text || ''}`;
    }
    // Handle fragment
    if (node.name === 'Fragment' || node.name === '') {
        return node.children
            ?.map(child => convertNodeToVue(child, reactMeta, depth))
            .join('\n') || '';
    }
    // Convert tag name (lowercase for HTML elements)
    const tagName = node.name.toLowerCase();
    // Convert attributes
    const attributes = convertAttributes(node, reactMeta);
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
    // Handle children
    const childrenContent = node.children
        ?.map(child => convertNodeToVue(child, reactMeta, depth + 1))
        .join('\n') || '';
    // Check for slot/children rendering
    const hasChildrenSlot = Object.values(node.bindings || {}).some(binding => binding?.code?.includes('children') || binding?.code?.includes('props.children'));
    let innerContent = childrenContent;
    if (hasChildrenSlot || childrenContent.includes('{children}')) {
        innerContent = `\n${indent}  <slot />\n${indent}`;
    }
    else if (childrenContent) {
        innerContent = `\n${childrenContent}\n${indent}`;
    }
    return `${indent}<${tagName}${attributes}>${innerContent}</${tagName}>`;
}
/**
 * Converts Mitosis bindings to Vue attributes.
 */
function convertAttributes(node, reactMeta) {
    const attrs = [];
    // Handle static properties
    for (const [name, value] of Object.entries(node.properties || {})) {
        if (name === 'className' || name === 'class') {
            // Will be handled by bindings for dynamic classes
            if (!node.bindings?.class && !node.bindings?.className) {
                attrs.push(`class="${value}"`);
            }
        }
        else {
            attrs.push(`${convertAttrName(name)}="${value}"`);
        }
    }
    // Handle bindings (dynamic attributes)
    for (const [name, binding] of Object.entries(node.bindings || {})) {
        if (!binding?.code)
            continue;
        const code = binding.code;
        if (name === 'className' || name === 'class') {
            // Convert className binding
            const classCode = convertClassBinding(code, reactMeta);
            attrs.push(`:class="${classCode}"`);
        }
        else if (name === 'ref') {
            // Convert ref to Vue ref
            const refName = code.replace('props.', '').replace('state.', '');
            attrs.push(`ref="${refName}"`);
        }
        else if (name.startsWith('on')) {
            // Convert event handlers
            const eventName = name.slice(2).toLowerCase();
            const handlerCode = convertEventHandler(code);
            attrs.push(`@${eventName}="${handlerCode}"`);
        }
        else if (name === 'spread' || name === '...') {
            // Handle spread props
            attrs.push(`v-bind="$attrs"`);
        }
        else {
            // Regular binding
            const attrName = convertAttrName(name);
            const bindingCode = convertBindingCode(code);
            attrs.push(`:${attrName}="${bindingCode}"`);
        }
    }
    // Add v-bind="$attrs" if the node has spread props
    if (node.spreadProps || hasSpreadInBindings(node)) {
        if (!attrs.some(a => a.includes('v-bind="$attrs"'))) {
            attrs.push(`v-bind="$attrs"`);
        }
    }
    return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
}
/**
 * Converts className binding to Vue class binding.
 */
function convertClassBinding(code, reactMeta) {
    // Remove props. prefix and use props.
    let result = code.replace(/props\./g, 'props.');
    // Handle className -> class rename in props access
    result = result.replace(/props\.className/g, 'props.class');
    // For cn() calls, ensure proper Vue syntax
    // cn(buttonVariants({ variant, size, className })) ->
    // cn(buttonVariants({ variant: props.variant, size: props.size, className: props.class }))
    if (reactMeta?.cva) {
        const cvaName = reactMeta.cva.name;
        // Convert CVA function calls to use props. prefix
        result = result.replace(new RegExp(`${cvaName}\\(\\{\\s*([^}]+)\\s*\\}\\)`, 'g'), (match, args) => {
            // Parse the arguments and add props. prefix where needed
            const convertedArgs = args
                .split(',')
                .map((arg) => {
                const trimmed = arg.trim();
                // Handle shorthand properties like { variant, size }
                if (!trimmed.includes(':')) {
                    const propName = trimmed === 'className' ? 'class' : trimmed;
                    return `${trimmed}: props.${propName}`;
                }
                // Handle explicit properties like { variant: props.variant }
                return trimmed.replace(/props\./g, 'props.');
            })
                .join(', ');
            return `${cvaName}({ ${convertedArgs} })`;
        });
    }
    return result;
}
/**
 * Converts event handler code for Vue.
 */
function convertEventHandler(code) {
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
function convertBindingCode(code) {
    // Keep props. prefix for Vue (accessed as props.xxx)
    let result = code;
    // Remove state. prefix
    result = result.replace(/state\./g, '');
    return result;
}
/**
 * Converts React attribute names to Vue attribute names.
 */
function convertAttrName(name) {
    const mapping = {
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
function hasSpreadInBindings(node) {
    const bindings = node.bindings || {};
    return Object.keys(bindings).some(key => key === 'spread' || key === '...' || key.startsWith('...'));
}
/**
 * Generates a fallback template when Mitosis parsing provides minimal info.
 */
function generateFallbackTemplate(component, reactMeta) {
    // Get base classes from component metadata
    const baseClasses = component.meta.baseClasses;
    // Determine element type from forwardRef
    let elementTag = 'div';
    if (reactMeta?.forwardRef) {
        const elementType = reactMeta.forwardRef.elementType;
        const tagMapping = {
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
    }
    else if (reactMeta?.usesCn && baseClasses) {
        classAttr = ` :class="cn('${baseClasses}', props.class)"`;
    }
    else if (baseClasses) {
        classAttr = ` :class="cn('${baseClasses}', props.class)"`;
    }
    else if (reactMeta?.usesCn) {
        classAttr = ` :class="cn(props.class)"`;
    }
    else {
        classAttr = ` :class="props.class"`;
    }
    // Build ref attribute - use elementRef to avoid conflict with Vue's ref import
    let refAttr = '';
    if (reactMeta?.forwardRef) {
        const refVarName = reactMeta.forwardRef.paramName === 'ref' ? 'elementRef' : reactMeta.forwardRef.paramName;
        refAttr = ` ref="${refVarName}"`;
    }
    // Generate template
    // Void elements (can't have children)
    const voidElements = ['input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
    // Elements that can have children but don't use slots (content comes from value/attribute)
    const noSlotElements = ['textarea', 'select'];
    if (voidElements.includes(elementTag)) {
        return `  <${elementTag}${refAttr}${classAttr} v-bind="$attrs" />`;
    }
    if (noSlotElements.includes(elementTag)) {
        // textarea and select get their value from the value attribute, not slots
        return `  <${elementTag}${refAttr}${classAttr} v-bind="$attrs" />`;
    }
    return `  <${elementTag}${refAttr}${classAttr} v-bind="$attrs">
    <slot />
  </${elementTag}>`;
}
//# sourceMappingURL=template.js.map