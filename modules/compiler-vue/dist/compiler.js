import { generateVueScript } from './generators/script.js';
import { generateVueTemplate } from './generators/template.js';
/**
 * Compiles a ExtendedMitosisComponent (Mitosis IR with React metadata) to Vue 3.
 */
export async function compileToVue(component, props, options = {}) {
    const { typescript = true, format = true, scriptSetup = true } = options;
    // Generate script block
    const scriptContent = generateVueScript(component, props, options);
    // Generate template
    const templateContent = generateVueTemplate(component, options);
    // Assemble the Vue SFC
    const langAttr = typescript ? ' lang="ts"' : '';
    const setupAttr = scriptSetup ? ' setup' : '';
    const parts = [];
    // Script block (script setup goes before template in Vue 3 convention)
    parts.push(`<script${setupAttr}${langAttr}>`);
    parts.push(scriptContent);
    parts.push('</script>');
    parts.push('');
    // Template
    parts.push(templateContent);
    let result = parts.join('\n');
    // Format with Prettier if requested
    if (format) {
        result = await formatVueCode(result);
    }
    return result;
}
/**
 * Formats Vue code using Prettier.
 */
async function formatVueCode(code) {
    try {
        const prettier = await import('prettier');
        return await prettier.format(code, {
            parser: 'vue',
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
 * Generates a complete Vue component file from parsed component data.
 */
export async function generateVueComponent(component, props, options = {}) {
    const code = await compileToVue(component, props, options);
    const filename = `${component.name}.vue`;
    return { code, filename };
}
/**
 * Compiles all components from a ParseResult to Vue 3.
 * Returns a map of filename to code.
 */
export async function compileAllToVue(parseResult, options = {}) {
    const results = new Map();
    for (const componentDef of parseResult.components) {
        // Skip re-exports for now (they need special handling)
        if (componentDef.isReExport) {
            continue;
        }
        const code = await compileToVue(componentDef.component, componentDef.props, options);
        const filename = `${componentDef.name}.vue`;
        results.set(filename, code);
    }
    return results;
}
//# sourceMappingURL=compiler.js.map