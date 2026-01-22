import {
  parseJsx,
  componentToSvelte,
  componentToVue,
  type MitosisComponent,
} from '@builder.io/mitosis';
import type {
  ConverterConfig,
  ConverterPlugin,
  PluginContext,
  ConversionResult,
  SvelteFrameworkOptions,
  VueFrameworkOptions,
} from './types/plugins.js';

/**
 * Main converter function that uses Mitosis with a plugin architecture.
 *yes 
 * This is a generic React-to-Framework converter that:
 * 1. Parses React TSX using Mitosis's parseJsx()
 * 2. Applies pre-parse and post-parse plugins
 * 3. Generates target framework code using Mitosis generators
 * 4. Applies post-generate plugins (e.g., Svelte 5 runes transformation)
 *
 * For shadcn components, add the shadcn plugin to extract CVA/cn/forwardRef patterns.
 * For generic React components, use without the shadcn plugin.
 */
export async function convert(
  sourceCode: string,
  config: ConverterConfig
): Promise<ConversionResult> {
  const {
    plugins = [],
    target,
    typescript = true,
    format = true,
    frameworkOptions,
    targetComponent,
  } = config;

  // Sort plugins by order
  const sortedPlugins = [...plugins].sort((a, b) => (a.order ?? 50) - (b.order ?? 50));

  // Initialize plugin context
  const context: PluginContext = {
    sourceCode,
    target,
    metadata: {},
    targetComponent,
  };

  const warnings: string[] = [];

  // 1. Run pre-parse plugins
  let processedCode = sourceCode;
  for (const plugin of sortedPlugins) {
    if (plugin.preParse) {
      try {
        processedCode = await plugin.preParse(processedCode, context);
      } catch (error) {
        warnings.push(`Plugin ${plugin.name} preParse error: ${error}`);
      }
    }
  }

  // 2. Parse with Mitosis
  let component: MitosisComponent;
  try {
    component = parseJsx(processedCode, {
      typescript: true,
    });
  } catch (parseError) {
    throw new Error(`Mitosis parse error: ${parseError}`);
  }

  // 3. Run post-parse plugins
  for (const plugin of sortedPlugins) {
    if (plugin.postParse) {
      try {
        component = await plugin.postParse(component, context);
      } catch (error) {
        warnings.push(`Plugin ${plugin.name} postParse error: ${error}`);
      }
    }
  }

  // 4. Run pre-generate plugins
  for (const plugin of sortedPlugins) {
    if (plugin.preGenerate) {
      try {
        component = await plugin.preGenerate(component, context);
      } catch (error) {
        warnings.push(`Plugin ${plugin.name} preGenerate error: ${error}`);
      }
    }
  }

  // 5. Generate target framework code using Mitosis generators
  let generatedCode: string;
  if (target === 'svelte') {
    generatedCode = generateSvelte(component, frameworkOptions as SvelteFrameworkOptions, typescript, format);
  } else if (target === 'vue') {
    generatedCode = generateVue(component, frameworkOptions as VueFrameworkOptions, typescript, format);
  } else {
    throw new Error(`Unsupported target: ${target}`);
  }

  // 6. Run post-generate plugins
  for (const plugin of sortedPlugins) {
    if (plugin.postGenerate) {
      try {
        generatedCode = await plugin.postGenerate(generatedCode, component, context);
      } catch (error) {
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
function generateSvelte(
  component: MitosisComponent,
  options: SvelteFrameworkOptions = {},
  typescript: boolean,
  format: boolean
): string {
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
function generateVue(
  component: MitosisComponent,
  options: VueFrameworkOptions = {},
  typescript: boolean,
  format: boolean
): string {
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
async function formatCode(code: string, target: string): Promise<string> {
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
    } else {
      return await prettier.format(code, {
        parser: 'vue',
        singleQuote: true,
        trailingComma: 'es5',
      });
    }
  } catch {
    // Return unformatted if Prettier fails
    return code;
  }
}

/**
 * Convenience function to convert a React component to Svelte
 */
export async function convertToSvelte(
  sourceCode: string,
  plugins: ConverterPlugin[] = [],
  options: Partial<ConverterConfig> = {}
): Promise<ConversionResult> {
  return convert(sourceCode, {
    target: 'svelte',
    plugins,
    typescript: options.typescript ?? true,
    format: options.format ?? true,
    frameworkOptions: options.frameworkOptions as SvelteFrameworkOptions,
  });
}

/**
 * Convenience function to convert a React component to Vue
 */
export async function convertToVue(
  sourceCode: string,
  plugins: ConverterPlugin[] = [],
  options: Partial<ConverterConfig> = {}
): Promise<ConversionResult> {
  return convert(sourceCode, {
    target: 'vue',
    plugins,
    typescript: options.typescript ?? true,
    format: options.format ?? true,
    frameworkOptions: options.frameworkOptions as VueFrameworkOptions,
  });
}

/**
 * Converts all components found in a React source file.
 *
 * Use this for files with multiple component definitions (e.g., Card.tsx with
 * Card, CardHeader, CardContent, CardFooter, etc.).
 *
 * This function:
 * 1. Uses the react-analyzer plugin to find all components in the file
 * 2. Converts each non-re-export component separately
 * 3. Returns a map of component name -> conversion result
 */
export async function convertAll(
  sourceCode: string,
  config: ConverterConfig
): Promise<Map<string, ConversionResult>> {
  const results = new Map<string, ConversionResult>();

  // First, run analysis to find all components
  const { Project, SyntaxKind } = await import('ts-morph');

  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      jsx: 2, // React
      target: 99, // ESNext
      module: 99, // ESNext
    },
  });

  const sourceFile = project.createSourceFile('component.tsx', sourceCode);

  // Find all component definitions
  const componentDefs = findAllComponents(sourceFile, SyntaxKind);

  // Convert each non-re-export component
  for (const compDef of componentDefs) {
    if (compDef.isReExport) {
      // Skip re-exports - they don't have their own JSX
      continue;
    }

    try {
      // Extract component-specific code
      const componentCode = extractComponentCode(sourceCode, compDef.name, sourceFile, SyntaxKind);

      // Convert the component with targetComponent set
      const result = await convert(componentCode, {
        ...config,
        targetComponent: compDef.name,
      });

      // Update the filename to match the component name
      result.filename = `${compDef.name}.${config.target === 'svelte' ? 'svelte' : 'vue'}`;

      results.set(compDef.name, result);
    } catch (error) {
      // Store error as a failed result
      results.set(compDef.name, {
        code: '',
        filename: `${compDef.name}.${config.target === 'svelte' ? 'svelte' : 'vue'}`,
        ir: {} as MitosisComponent,
        warnings: [`Failed to convert ${compDef.name}: ${error}`],
        metadata: {},
      });
    }
  }

  return results;
}

/**
 * Finds all component definitions in a source file
 */
function findAllComponents(
  sourceFile: any,
  SyntaxKind: any
): Array<{ name: string; isReExport: boolean; reExportSource?: string }> {
  const components: Array<{ name: string; isReExport: boolean; reExportSource?: string }> = [];

  // Find variable declarations
  const variableStatements = sourceFile.getVariableStatements();
  for (const statement of variableStatements) {
    for (const declaration of statement.getDeclarations()) {
      const name = declaration.getName();
      const init = declaration.getInitializer();
      if (!init) continue;

      const initText = init.getText();

      // Check if first letter is uppercase (component naming convention)
      if (name[0] !== name[0].toUpperCase()) {
        continue;
      }

      // Check for forwardRef
      if (initText.includes('forwardRef') || initText.includes('React.forwardRef')) {
        components.push({ name, isReExport: false });
      }
      // Check for re-exports (e.g., const Tabs = TabsPrimitive.Root)
      else if (initText.includes('Primitive.') || initText.includes('Primitives.')) {
        components.push({
          name,
          isReExport: true,
          reExportSource: initText,
        });
      }
      // Check for arrow function components
      else if (initText.includes('=>') && (initText.includes('<') || initText.includes('return'))) {
        components.push({ name, isReExport: false });
      }
    }
  }

  // Find function declarations
  for (const func of sourceFile.getFunctions()) {
    const name = func.getName();
    if (name && name[0] === name[0].toUpperCase()) {
      components.push({ name, isReExport: false });
    }
  }

  return components;
}

/**
 * Extracts the code for a specific component from the source file.
 * Includes the component definition and any imports/utilities it needs.
 *
 * Note: We don't add export default here because the react-analyzer plugin's
 * transformForMitosis function handles export default generation during preParse.
 */
function extractComponentCode(
  fullCode: string,
  componentName: string,
  sourceFile: any,
  SyntaxKind: any
): string {
  // Return the full code - the react-analyzer plugin will handle the transformation
  // to create the appropriate export default function
  return fullCode;
}

export { parseJsx, componentToSvelte, componentToVue };
