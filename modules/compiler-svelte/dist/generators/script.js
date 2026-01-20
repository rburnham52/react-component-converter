/**
 * Generates the <script> block for a Svelte 5 component.
 * Uses runes: $props(), $state(), $derived(), $effect(), $bindable()
 */
export function generateSvelteScript(component, props, options = {}) {
    const { svelteVersion = 5, useRunes = true, cnImportPath = '$lib/utils', typescript = true } = options;
    const lines = [];
    const reactMeta = component.meta.reactMeta;
    // Language attribute
    const langAttr = typescript ? ' lang="ts"' : '';
    // Imports
    lines.push(generateImports(component, reactMeta, cnImportPath));
    // CVA definition (if present)
    if (reactMeta?.cva) {
        lines.push('');
        lines.push(generateCvaDefinition(reactMeta.cva));
    }
    // Props interface/type (for TypeScript)
    if (typescript) {
        lines.push('');
        lines.push(generatePropsType(props, reactMeta, component));
    }
    // $props() destructuring (Svelte 5 runes)
    if (svelteVersion === 5 && useRunes) {
        lines.push('');
        lines.push(generatePropsDestructuring(props, reactMeta, typescript, component));
    }
    // State declarations (from component.state)
    if (Object.keys(component.state).length > 0) {
        lines.push('');
        lines.push(generateStateDeclarations(component));
    }
    return lines.filter(line => line !== undefined).join('\n');
}
/**
 * Generates import statements for the Svelte component.
 */
function generateImports(component, reactMeta, cnImportPath) {
    const imports = [];
    // cn utility import
    if (reactMeta?.usesCn) {
        imports.push(`import { cn } from "${cnImportPath}";`);
    }
    // CVA import
    if (reactMeta?.cva) {
        imports.push(`import { cva, type VariantProps } from "class-variance-authority";`);
    }
    // HTML attributes type import for Svelte
    if (reactMeta?.forwardRef) {
        const elementType = reactMeta.forwardRef.elementType;
        const importName = getHtmlAttributesImportName(elementType);
        if (importName) {
            imports.push(`import type { ${importName} } from "svelte/elements";`);
        }
    }
    // Other imports from original component (filtered)
    if (reactMeta?.originalImports) {
        for (const imp of reactMeta.originalImports) {
            // Skip React imports
            if (imp.category === 'react')
                continue;
            // Skip cn/cva imports (already handled)
            if (imp.namedImports?.includes('cn') || imp.namedImports?.includes('cva'))
                continue;
            // Skip Radix imports (not supported in POC)
            if (imp.category === 'radix')
                continue;
            // Transform import source for framework-specific packages
            let source = imp.source;
            // Map lucide-react to lucide-svelte
            if (source === 'lucide-react') {
                source = 'lucide-svelte';
            }
            // Include other imports
            if (imp.namedImports && imp.namedImports.length > 0) {
                const filteredImports = imp.namedImports.filter(name => name !== 'cn' && name !== 'cva' && name !== 'VariantProps');
                if (filteredImports.length > 0) {
                    imports.push(`import { ${filteredImports.join(', ')} } from "${source}";`);
                }
            }
            else if (imp.defaultImport) {
                imports.push(`import ${imp.defaultImport} from "${source}";`);
            }
        }
    }
    return imports.join('\n');
}
/**
 * Generates the CVA definition.
 */
function generateCvaDefinition(cva) {
    const lines = [];
    lines.push(`const ${cva.name} = cva(`);
    lines.push(`  "${cva.baseClasses}",`);
    lines.push(`  {`);
    // Variants
    lines.push(`    variants: {`);
    for (const [variantName, variantValues] of Object.entries(cva.variants)) {
        lines.push(`      ${variantName}: {`);
        for (const [valueName, classes] of Object.entries(variantValues)) {
            lines.push(`        ${valueName}: "${classes}",`);
        }
        lines.push(`      },`);
    }
    lines.push(`    },`);
    // Default variants
    lines.push(`    defaultVariants: {`);
    for (const [name, value] of Object.entries(cva.defaultVariants)) {
        lines.push(`      ${name}: "${value}",`);
    }
    lines.push(`    },`);
    lines.push(`  }`);
    lines.push(`);`);
    return lines.join('\n');
}
/**
 * Generates the Props type/interface for TypeScript.
 */
function generatePropsType(props, reactMeta, component) {
    const lines = [];
    const baseClasses = component?.meta?.baseClasses;
    // Determine base HTML attributes type
    let extendsClause = '';
    if (reactMeta?.forwardRef) {
        const htmlAttrsType = getHtmlAttributesType(reactMeta.forwardRef.elementType);
        if (htmlAttrsType) {
            extendsClause = ` extends ${htmlAttrsType}`;
        }
    }
    // Add VariantProps if using CVA
    if (reactMeta?.cva) {
        const variantPropsType = `VariantProps<typeof ${reactMeta.cva.name}>`;
        if (extendsClause) {
            extendsClause += `, ${variantPropsType}`;
        }
        else {
            extendsClause = ` extends ${variantPropsType}`;
        }
    }
    lines.push(`interface Props${extendsClause} {`);
    // Add custom props (non-variant, non-standard HTML attributes)
    for (const prop of props) {
        if (!prop.isVariant && prop.name !== 'className' && prop.name !== 'class') {
            const optional = prop.optional ? '?' : '';
            lines.push(`  ${prop.name}${optional}: ${prop.type};`);
        }
    }
    // Add class prop (renamed from className, when component uses cn with baseClasses, or when CVA is used)
    const classNameProp = props.find(p => p.name === 'className' || p.name === 'class');
    if (classNameProp || (reactMeta?.usesCn && baseClasses) || reactMeta?.cva) {
        lines.push(`  class?: string;`);
    }
    // Add ref prop if using forwardRef
    if (reactMeta?.forwardRef) {
        lines.push(`  ref?: ${reactMeta.forwardRef.elementType} | null;`);
    }
    lines.push(`}`);
    return lines.join('\n');
}
/**
 * Generates the $props() destructuring for Svelte 5.
 */
function generatePropsDestructuring(props, reactMeta, typescript, component) {
    const destructuredProps = [];
    // Handle className -> class rename
    const hasClassName = props.some(p => p.name === 'className');
    const baseClasses = component?.meta?.baseClasses;
    // Add className if explicitly defined OR if component uses cn() with baseClasses or CVA
    if (hasClassName || (reactMeta?.usesCn && baseClasses) || reactMeta?.cva) {
        destructuredProps.push('class: className');
    }
    // Add variant props with defaults from CVA config
    if (reactMeta?.cva) {
        for (const [variantName, _values] of Object.entries(reactMeta.cva.variants)) {
            const defaultValue = reactMeta.cva.defaultVariants[variantName];
            if (defaultValue) {
                destructuredProps.push(`${variantName} = "${defaultValue}"`);
            }
            else {
                destructuredProps.push(variantName);
            }
        }
    }
    // Add non-variant props
    for (const prop of props) {
        if (prop.isVariant && prop.defaultValue !== undefined) {
            // Skip if already added from CVA
            if (!reactMeta?.cva || !Object.keys(reactMeta.cva.variants).includes(prop.name)) {
                destructuredProps.push(`${prop.name} = "${prop.defaultValue}"`);
            }
        }
        else if (prop.name !== 'className' && prop.name !== 'class') {
            destructuredProps.push(prop.name);
        }
    }
    // Add ref as $bindable if using forwardRef
    if (reactMeta?.forwardRef) {
        destructuredProps.push(`${reactMeta.forwardRef.paramName} = $bindable(null)`);
    }
    // Add children
    destructuredProps.push('children');
    // Add rest props
    destructuredProps.push('...restProps');
    const typeAnnotation = typescript ? ': Props' : '';
    return `let { ${destructuredProps.join(', ')} }${typeAnnotation} = $props();`;
}
/**
 * Generates state declarations from Mitosis state.
 */
function generateStateDeclarations(component) {
    const lines = [];
    for (const [name, value] of Object.entries(component.state)) {
        const initialValue = typeof value === 'object' && value !== null && 'code' in value
            ? value.code
            : JSON.stringify(value);
        lines.push(`let ${name} = $state(${initialValue});`);
    }
    return lines.join('\n');
}
/**
 * Maps HTML element types to Svelte HTML attributes types.
 * Returns both the import name and the full type with generic.
 */
function getHtmlAttributesType(elementType) {
    // Svelte uses HTMLAttributes<T> for generic elements
    const simpleMapping = {
        'HTMLButtonElement': 'HTMLButtonAttributes',
        'HTMLInputElement': 'HTMLInputAttributes',
        'HTMLTextAreaElement': 'HTMLTextareaAttributes',
        'HTMLSelectElement': 'HTMLSelectAttributes',
        'HTMLAnchorElement': 'HTMLAnchorAttributes',
        'HTMLFormElement': 'HTMLFormAttributes',
        'HTMLImageElement': 'HTMLImgAttributes',
    };
    if (simpleMapping[elementType]) {
        return simpleMapping[elementType];
    }
    // For generic elements, use HTMLAttributes<T>
    return `HTMLAttributes<${elementType}>`;
}
/**
 * Gets just the import name (without generic parameter).
 */
function getHtmlAttributesImportName(elementType) {
    const simpleTypes = ['HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement',
        'HTMLSelectElement', 'HTMLAnchorElement', 'HTMLFormElement', 'HTMLImageElement'];
    if (simpleTypes.includes(elementType)) {
        return getHtmlAttributesType(elementType);
    }
    // For generic elements, import just HTMLAttributes
    return 'HTMLAttributes';
}
//# sourceMappingURL=script.js.map