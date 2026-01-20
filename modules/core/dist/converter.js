import { parseJsx, componentToSvelte, componentToVue, } from '@builder.io/mitosis';
/**
 * Main converter function that uses Mitosis with a plugin architecture.
 *
 * This is a generic React-to-Framework converter that:
 * 1. Parses React TSX using Mitosis's parseJsx()
 * 2. Applies pre-parse and post-parse plugins
 * 3. Generates target framework code using Mitosis generators
 * 4. Applies post-generate plugins (e.g., Svelte 5 runes transformation)
 *
 * For shadcn components, add the shadcn plugin to extract CVA/cn/forwardRef patterns.
 * For generic React components, use without the shadcn plugin.
 */
export async function convert(sourceCode, config) {
    const { plugins = [], target, typescript = true, format = true, frameworkOptions, } = config;
    // Sort plugins by order
    const sortedPlugins = [...plugins].sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
    // Initialize plugin context
    const context = {
        sourceCode,
        target,
        metadata: {},
    };
    const warnings = [];
    // 1. Run pre-parse plugins
    let processedCode = sourceCode;
    for (const plugin of sortedPlugins) {
        if (plugin.preParse) {
            try {
                processedCode = await plugin.preParse(processedCode, context);
            }
            catch (error) {
                warnings.push(`Plugin ${plugin.name} preParse error: ${error}`);
            }
        }
    }
    // 2. Parse with Mitosis
    let component;
    try {
        component = parseJsx(processedCode, {
            typescript: true,
        });
    }
    catch (parseError) {
        throw new Error(`Mitosis parse error: ${parseError}`);
    }
    // 3. Run post-parse plugins
    for (const plugin of sortedPlugins) {
        if (plugin.postParse) {
            try {
                component = await plugin.postParse(component, context);
            }
            catch (error) {
                warnings.push(`Plugin ${plugin.name} postParse error: ${error}`);
            }
        }
    }
    // 4. Run pre-generate plugins
    for (const plugin of sortedPlugins) {
        if (plugin.preGenerate) {
            try {
                component = await plugin.preGenerate(component, context);
            }
            catch (error) {
                warnings.push(`Plugin ${plugin.name} preGenerate error: ${error}`);
            }
        }
    }
    // 5. Generate target framework code using Mitosis generators
    let generatedCode;
    if (target === 'svelte') {
        generatedCode = generateSvelte(component, frameworkOptions, typescript, format);
    }
    else if (target === 'vue') {
        generatedCode = generateVue(component, frameworkOptions, typescript, format);
    }
    else {
        throw new Error(`Unsupported target: ${target}`);
    }
    // 6. Run post-generate plugins
    for (const plugin of sortedPlugins) {
        if (plugin.postGenerate) {
            try {
                generatedCode = await plugin.postGenerate(generatedCode, component, context);
            }
            catch (error) {
                warnings.push(`Plugin ${plugin.name} postGenerate error: ${error}`);
            }
        }
    }
    // 7. Format output if requested
    if (format) {
        generatedCode = await formatCode(generatedCode, target);
    }
    // Determine output filename
    const ext = target === 'svelte' ? 'svelte' : 'vue';
    const filename = `${component.name || 'Component'}.${ext}`;
    return {
        code: generatedCode,
        filename,
        ir: component,
        warnings,
        metadata: context.metadata,
    };
}
/**
 * Generates Svelte code using Mitosis's componentToSvelte
 */
function generateSvelte(component, options = {}, typescript, format) {
    const { stateType = 'variables' } = options;
    // Mitosis generators expect { component } wrapper
    return componentToSvelte({
        typescript,
        prettier: format,
        stateType,
    })({ component });
}
/**
 * Generates Vue code using Mitosis's componentToVue
 */
function generateVue(component, options = {}, typescript, format) {
    const { api = 'composition' } = options;
    // Mitosis generators expect { component } wrapper
    return componentToVue({
        typescript,
        prettier: format,
        api,
    })({ component });
}
/**
 * Formats generated code using Prettier
 */
async function formatCode(code, target) {
    try {
        const prettier = await import('prettier');
        if (target === 'svelte') {
            const sveltePlugin = await import('prettier-plugin-svelte');
            return await prettier.format(code, {
                parser: 'svelte',
                plugins: [sveltePlugin.default || sveltePlugin],
                singleQuote: true,
                trailingComma: 'es5',
            });
        }
        else {
            return await prettier.format(code, {
                parser: 'vue',
                singleQuote: true,
                trailingComma: 'es5',
            });
        }
    }
    catch {
        // Return unformatted if Prettier fails
        return code;
    }
}
/**
 * Convenience function to convert a React component to Svelte
 */
export async function convertToSvelte(sourceCode, plugins = [], options = {}) {
    return convert(sourceCode, {
        target: 'svelte',
        plugins,
        typescript: options.typescript ?? true,
        format: options.format ?? true,
        frameworkOptions: options.frameworkOptions,
    });
}
/**
 * Convenience function to convert a React component to Vue
 */
export async function convertToVue(sourceCode, plugins = [], options = {}) {
    return convert(sourceCode, {
        target: 'vue',
        plugins,
        typescript: options.typescript ?? true,
        format: options.format ?? true,
        frameworkOptions: options.frameworkOptions,
    });
}
export { parseJsx, componentToSvelte, componentToVue };
//# sourceMappingURL=converter.js.map