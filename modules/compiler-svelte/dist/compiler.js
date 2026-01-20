import { generateSvelteScript } from './generators/script.js';
import { generateSvelteTemplate } from './generators/template.js';
/**
 * Compiles an ExtendedMitosisComponent (Mitosis IR with React metadata) to Svelte 5.
 */
export async function compileToSvelte(component, props, options = {}) {
    const { typescript = true, format = true, svelteVersion = 5 } = options;
    // Generate script block
    const scriptContent = generateSvelteScript(component, props, options);
    // Generate template
    const templateContent = generateSvelteTemplate(component, options);
    // Assemble the Svelte component
    const langAttr = typescript ? ' lang="ts"' : '';
    const parts = [];
    // Script block
    parts.push(`<script${langAttr}>`);
    parts.push(scriptContent);
    parts.push('</script>');
    parts.push('');
    // Template (no wrapper in Svelte)
    parts.push(templateContent);
    let result = parts.join('\n');
    // Format with Prettier if requested
    if (format) {
        result = await formatSvelteCode(result);
    }
    return result;
}
/**
 * Formats Svelte code using Prettier.
 */
async function formatSvelteCode(code) {
    try {
        const prettier = await import('prettier');
        const sveltePlugin = await import('prettier-plugin-svelte');
        return await prettier.format(code, {
            parser: 'svelte',
            plugins: [sveltePlugin.default || sveltePlugin],
            singleQuote: true,
            trailingComma: 'es5',
            tabWidth: 2,
            printWidth: 100,
        });
    }
    catch (error) {
        // If formatting fails, return unformatted code
        console.warn('Prettier formatting failed:', error);
        return code;
    }
}
/**
 * Generates a complete Svelte component file from parsed component data.
 */
export async function generateSvelteComponent(component, props, options = {}) {
    const code = await compileToSvelte(component, props, options);
    const filename = `${component.name}.svelte`;
    return { code, filename };
}
/**
 * Compiles all components from a ParseResult to Svelte 5.
 * Returns a map of filename to code.
 */
export async function compileAllToSvelte(parseResult, options = {}) {
    const results = new Map();
    for (const componentDef of parseResult.components) {
        // Skip re-exports for now (they need special handling)
        if (componentDef.isReExport) {
            continue;
        }
        const code = await compileToSvelte(componentDef.component, componentDef.props, options);
        const filename = `${componentDef.name}.svelte`;
        results.set(filename, code);
    }
    return results;
}
/**
 * Compiles all components into a single file (for compound components like Card).
 */
export async function compileAllToSingleFile(parseResult, options = {}) {
    const { typescript = true } = options;
    const langAttr = typescript ? ' lang="ts"' : '';
    const parts = [];
    // Shared imports at the top
    parts.push(`<script${langAttr} context="module">`);
    parts.push(`  // Shared imports for all components`);
    if (parseResult.sharedMeta.usesCn) {
        parts.push(`  import { cn } from '$lib/utils';`);
    }
    // Add CVA definitions if any
    if (Object.keys(parseResult.sharedMeta.cvaConfigs).length > 0) {
        parts.push(`  import { cva, type VariantProps } from 'class-variance-authority';`);
        parts.push('');
        for (const [name, config] of Object.entries(parseResult.sharedMeta.cvaConfigs)) {
            parts.push(generateCvaDefinition(config));
            parts.push('');
        }
    }
    parts.push('</script>');
    parts.push('');
    // Generate each component
    for (const componentDef of parseResult.components) {
        if (componentDef.isReExport)
            continue;
        const componentCode = await generateSimplifiedSvelteComponent(componentDef, options);
        parts.push(`<!-- ${componentDef.name} -->`);
        parts.push(componentCode);
        parts.push('');
    }
    return parts.join('\n');
}
/**
 * Generates a simplified Svelte component for use in combined file.
 */
async function generateSimplifiedSvelteComponent(componentDef, options) {
    const { typescript = true } = options;
    const langAttr = typescript ? ' lang="ts"' : '';
    const parts = [];
    // For now, generate individual component code
    const code = await compileToSvelte(componentDef.component, componentDef.props, options);
    return code;
}
/**
 * Generates CVA definition code.
 */
function generateCvaDefinition(cva) {
    const lines = [];
    lines.push(`  export const ${cva.name} = cva(`);
    lines.push(`    '${cva.baseClasses}',`);
    lines.push(`    {`);
    // Variants
    lines.push(`      variants: {`);
    for (const [variantName, variantValues] of Object.entries(cva.variants)) {
        lines.push(`        ${variantName}: {`);
        for (const [valueName, classes] of Object.entries(variantValues)) {
            lines.push(`          ${valueName}: '${classes}',`);
        }
        lines.push(`        },`);
    }
    lines.push(`      },`);
    // Default variants
    lines.push(`      defaultVariants: {`);
    for (const [name, value] of Object.entries(cva.defaultVariants)) {
        lines.push(`        ${name}: '${value}',`);
    }
    lines.push(`      },`);
    lines.push(`    }`);
    lines.push(`  );`);
    return lines.join('\n');
}
//# sourceMappingURL=compiler.js.map