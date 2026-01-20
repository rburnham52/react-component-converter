/**
 * Generates the <script setup> block for a Vue 3 component.
 */
export function generateVueScript(component, props, options = {}) {
    const { typescript = true, cnImportPath = '@/lib/utils' } = options;
    const lines = [];
    const reactMeta = component.meta.reactMeta;
    const baseClasses = component.meta.baseClasses;
    // Imports
    lines.push(generateImports(component, reactMeta, cnImportPath, props, baseClasses));
    // CVA definition (if present)
    if (reactMeta?.cva) {
        lines.push('');
        lines.push(generateCvaDefinition(reactMeta.cva));
    }
    // Props interface (for TypeScript)
    if (typescript) {
        lines.push('');
        lines.push(generatePropsInterface(props, reactMeta, baseClasses));
    }
    // defineProps and withDefaults
    lines.push('');
    lines.push(generatePropsDefinition(props, reactMeta, typescript));
    // Ref handling for forwardRef equivalent
    if (reactMeta?.forwardRef) {
        lines.push('');
        lines.push(generateRefHandling(reactMeta.forwardRef));
    }
    // State declarations (from component.state)
    if (Object.keys(component.state).length > 0) {
        lines.push('');
        lines.push(generateStateDeclarations(component));
    }
    return lines.filter(line => line !== undefined).join('\n');
}
/**
 * Generates import statements for the Vue component.
 */
function generateImports(component, reactMeta, cnImportPath, props, baseClasses) {
    const imports = [];
    const vueImports = [];
    // Check what Vue imports we need
    if (reactMeta?.forwardRef) {
        vueImports.push('ref');
        // Note: We don't import type Ref since we use ref<T>() inline typing
    }
    if (Object.keys(component.state || {}).length > 0) {
        if (!vueImports.includes('ref'))
            vueImports.push('ref');
    }
    // Check for computed values
    const hasComputed = Object.values(component.state || {}).some(s => typeof s === 'object' && s !== null && 'code' in s);
    if (hasComputed) {
        vueImports.push('computed');
    }
    // Add Vue imports
    if (vueImports.length > 0) {
        imports.push(`import { ${vueImports.join(', ')} } from 'vue';`);
    }
    // cn utility import (also needed when we have baseClasses)
    if (reactMeta?.usesCn || baseClasses) {
        imports.push(`import { cn } from '${cnImportPath}';`);
    }
    // CVA import (no VariantProps - Vue can't resolve it at compile time)
    if (reactMeta?.cva) {
        imports.push(`import { cva } from 'class-variance-authority';`);
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
            // Map lucide-react to lucide-vue-next
            if (source === 'lucide-react') {
                source = 'lucide-vue-next';
            }
            // Include other imports
            if (imp.namedImports && imp.namedImports.length > 0) {
                const filteredImports = imp.namedImports.filter(name => name !== 'cn' && name !== 'cva' && name !== 'VariantProps');
                if (filteredImports.length > 0) {
                    imports.push(`import { ${filteredImports.join(', ')} } from '${source}';`);
                }
            }
            else if (imp.defaultImport) {
                imports.push(`import ${imp.defaultImport} from '${source}';`);
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
    lines.push(`  '${cva.baseClasses}',`);
    lines.push(`  {`);
    // Variants
    lines.push(`    variants: {`);
    for (const [variantName, variantValues] of Object.entries(cva.variants)) {
        lines.push(`      ${variantName}: {`);
        for (const [valueName, classes] of Object.entries(variantValues)) {
            lines.push(`        ${valueName}: '${classes}',`);
        }
        lines.push(`      },`);
    }
    lines.push(`    },`);
    // Default variants
    lines.push(`    defaultVariants: {`);
    for (const [name, value] of Object.entries(cva.defaultVariants)) {
        lines.push(`      ${name}: '${value}',`);
    }
    lines.push(`    },`);
    lines.push(`  }`);
    lines.push(`);`);
    return lines.join('\n');
}
/**
 * Generates the Props interface for TypeScript.
 * Note: Vue's compiler cannot resolve VariantProps<typeof ...> at compile time,
 * so we expand the variant types directly into the interface.
 */
function generatePropsInterface(props, reactMeta, baseClasses) {
    const lines = [];
    // Note: We don't use extends VariantProps<...> because Vue's compiler
    // cannot resolve it. Instead, we inline the variant prop types.
    lines.push(`interface Props {`);
    // Add custom props
    for (const prop of props) {
        if (!prop.isVariant && prop.name !== 'className') {
            const optional = prop.optional ? '?' : '';
            lines.push(`  ${prop.name}${optional}: ${prop.type};`);
        }
    }
    // Add class prop (Vue uses class, not className)
    // Add when explicitly defined, when component has baseClasses, or when using CVA
    const classNameProp = props.find(p => p.name === 'className' || p.name === 'class');
    if (classNameProp || baseClasses || reactMeta?.cva) {
        lines.push(`  class?: string;`);
    }
    // Add variant props explicitly if using CVA
    if (reactMeta?.cva) {
        for (const [variantName, variantValues] of Object.entries(reactMeta.cva.variants)) {
            const values = Object.keys(variantValues).map(v => `'${v}'`).join(' | ');
            lines.push(`  ${variantName}?: ${values};`);
        }
    }
    lines.push(`}`);
    return lines.join('\n');
}
/**
 * Generates defineProps with withDefaults.
 */
function generatePropsDefinition(props, reactMeta, typescript) {
    const lines = [];
    // Collect default values
    const defaults = {};
    // Add variant defaults from CVA
    if (reactMeta?.cva) {
        for (const [name, value] of Object.entries(reactMeta.cva.defaultVariants)) {
            defaults[name] = `'${value}'`;
        }
    }
    // Add other prop defaults
    for (const prop of props) {
        if (prop.defaultValue !== undefined && !defaults[prop.name]) {
            defaults[prop.name] = typeof prop.defaultValue === 'string'
                ? `'${prop.defaultValue}'`
                : String(prop.defaultValue);
        }
    }
    // Generate defineProps
    if (typescript) {
        if (Object.keys(defaults).length > 0) {
            lines.push(`const props = withDefaults(defineProps<Props>(), {`);
            for (const [name, value] of Object.entries(defaults)) {
                lines.push(`  ${name}: ${value},`);
            }
            lines.push(`});`);
        }
        else {
            lines.push(`const props = defineProps<Props>();`);
        }
    }
    else {
        lines.push(`const props = defineProps({`);
        for (const prop of props) {
            const type = mapTypeToVueType(prop.type);
            const defaultValue = defaults[prop.name];
            if (defaultValue) {
                lines.push(`  ${prop.name}: { type: ${type}, default: ${defaultValue} },`);
            }
            else if (!prop.optional) {
                lines.push(`  ${prop.name}: { type: ${type}, required: true },`);
            }
            else {
                lines.push(`  ${prop.name}: ${type},`);
            }
        }
        lines.push(`});`);
    }
    return lines.join('\n');
}
/**
 * Generates ref handling for forwardRef equivalent.
 */
function generateRefHandling(forwardRef) {
    const lines = [];
    // Use elementRef to avoid conflict with Vue's ref import
    const refVarName = forwardRef.paramName === 'ref' ? 'elementRef' : forwardRef.paramName;
    lines.push(`const ${refVarName} = ref<${forwardRef.elementType} | null>(null);`);
    lines.push('');
    lines.push(`defineExpose({ ${refVarName} });`);
    return lines.join('\n');
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
        lines.push(`const ${name} = ref(${initialValue});`);
    }
    return lines.join('\n');
}
/**
 * Maps TypeScript types to Vue prop types.
 */
function mapTypeToVueType(tsType) {
    const mapping = {
        string: 'String',
        number: 'Number',
        boolean: 'Boolean',
        object: 'Object',
        array: 'Array',
        function: 'Function',
    };
    const lowerType = tsType.toLowerCase();
    return mapping[lowerType] || 'null';
}
//# sourceMappingURL=script.js.map