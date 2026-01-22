import type { MitosisComponent } from '@builder.io/mitosis';
import type {
  ConverterPlugin,
  PluginContext,
  CvaPluginOptions,
  CnPluginOptions,
  ForwardRefPluginOptions,
} from '../types/plugins.js';
import type { ReactAnalyzerMetadata } from './react-analyzer-plugin.js';

/**
 * Combined options for the shadcn plugin
 */
export interface ShadcnPluginOptions
  extends CvaPluginOptions,
    CnPluginOptions,
    ForwardRefPluginOptions {}

/**
 * Metadata extracted by the shadcn plugin
 */
export interface ShadcnMetadata {
  /** CVA configuration if found */
  cva?: {
    name: string;
    baseClasses: string;
    variants: Record<string, Record<string, string>>;
    defaultVariants: Record<string, string>;
  };
  /** Whether component uses cn() utility */
  usesCn: boolean;
  /** forwardRef configuration if found */
  forwardRef?: {
    elementType: string;
    paramName: string;
  };
  /** Original imports for transformation */
  imports: Array<{
    source: string;
    namedImports?: string[];
    defaultImport?: string;
    category: 'react' | 'radix' | 'utility' | 'style' | 'icon' | 'other';
  }>;
}

/**
 * Creates a shadcn plugin that extracts CVA, cn, and forwardRef patterns
 * from React shadcn components.
 *
 * This plugin is OPTIONAL - use it only when converting shadcn components.
 * For generic React components, skip this plugin.
 *
 * IMPORTANT: This plugin should run AFTER the react-analyzer plugin.
 * It consumes metadata from context.metadata.reactAnalyzer if available,
 * otherwise falls back to regex-based extraction.
 */
export function createShadcnPlugin(options: ShadcnPluginOptions = {}): ConverterPlugin {
  return {
    name: 'shadcn',
    order: 10, // Run after react-analyzer (order: 5)

    postParse: async (component: MitosisComponent, context: PluginContext) => {
      // Try to use metadata from react-analyzer plugin first
      const analyzerMeta = context.metadata.reactAnalyzer as ReactAnalyzerMetadata | undefined;

      let metadata: ShadcnMetadata;

      if (analyzerMeta) {
        // Use pre-extracted metadata from react-analyzer plugin
        const primaryCvaName = Object.keys(analyzerMeta.cvaConfigs)[0];
        const primaryCva = primaryCvaName ? analyzerMeta.cvaConfigs[primaryCvaName] : undefined;

        metadata = {
          cva: primaryCva ? {
            name: primaryCva.name,
            baseClasses: primaryCva.baseClasses,
            variants: primaryCva.variants,
            defaultVariants: primaryCva.defaultVariants,
          } : undefined,
          usesCn: analyzerMeta.usesCn,
          forwardRef: analyzerMeta.forwardRef,
          imports: analyzerMeta.imports,
        };
      } else {
        // Fallback to regex-based extraction if react-analyzer wasn't used
        const sourceCode = context.sourceCode;
        metadata = {
          usesCn: false,
          imports: [],
        };

        // Extract CVA configuration
        const cvaConfig = extractCvaConfig(sourceCode);
        if (cvaConfig) {
          metadata.cva = cvaConfig;
        }

        // Check for cn() utility usage
        metadata.usesCn = checkUsesCn(sourceCode);

        // Extract forwardRef configuration
        const forwardRefConfig = extractForwardRef(sourceCode);
        if (forwardRefConfig) {
          metadata.forwardRef = forwardRefConfig;
        }

        // Extract and categorize imports
        metadata.imports = extractImports(sourceCode);
      }

      // Store in context metadata for other plugins and compiler
      context.metadata.shadcn = metadata;

      // Also store in component meta for Mitosis generators
      (component.meta as Record<string, unknown>).shadcnMeta = metadata;

      // If reactMeta wasn't set by analyzer, set it now
      if (!(component.meta as Record<string, unknown>).reactMeta) {
        (component.meta as Record<string, unknown>).reactMeta = metadata;
      }

      return component;
    },
  };
}

// ============================================================================
// Fallback Regex-based Extraction (used when react-analyzer isn't available)
// ============================================================================

/**
 * Extracts CVA configuration from source code
 */
function extractCvaConfig(code: string): ShadcnMetadata['cva'] | undefined {
  // Match cva() calls: const xxxVariants = cva("base classes", { variants: {...} })
  const cvaMatch = code.match(
    /const\s+(\w+)\s*=\s*cva\s*\(\s*["'`]([^"'`]*)["'`]\s*,\s*\{/
  );

  if (!cvaMatch) return undefined;

  const name = cvaMatch[1];
  const baseClasses = cvaMatch[2];

  // Extract variants object
  const variants = extractVariants(code, name);
  const defaultVariants = extractDefaultVariants(code, name);

  return {
    name,
    baseClasses,
    variants,
    defaultVariants,
  };
}

/**
 * Extracts variants from CVA configuration
 */
function extractVariants(code: string, cvaName: string): Record<string, Record<string, string>> {
  const variants: Record<string, Record<string, string>> = {};

  // Find the CVA call for this name
  const cvaPattern = new RegExp(
    `const\\s+${cvaName}\\s*=\\s*cva\\s*\\([^{]*\\{([\\s\\S]*?)\\}\\s*\\)`,
    'm'
  );
  const match = code.match(cvaPattern);
  if (!match) return variants;

  const configBlock = match[1];

  // Find variants: { ... }
  const variantsMatch = configBlock.match(/variants\s*:\s*\{([\s\S]*?)\n\s*\}/);
  if (!variantsMatch) return variants;

  const variantsBlock = variantsMatch[1];

  // Parse each variant
  const variantPattern = /(\w+)\s*:\s*\{([\s\S]*?)\}/g;
  let variantMatch;
  while ((variantMatch = variantPattern.exec(variantsBlock)) !== null) {
    const variantName = variantMatch[1];
    const variantValues = variantMatch[2];

    variants[variantName] = {};

    // Parse each value
    const valuePattern = /(\w+)\s*:\s*["'`]([^"'`]*)["'`]/g;
    let valueMatch;
    while ((valueMatch = valuePattern.exec(variantValues)) !== null) {
      variants[variantName][valueMatch[1]] = valueMatch[2];
    }
  }

  return variants;
}

/**
 * Extracts default variants from CVA configuration
 */
function extractDefaultVariants(code: string, cvaName: string): Record<string, string> {
  const defaults: Record<string, string> = {};

  // Find defaultVariants in the CVA call
  const defaultsPattern = /defaultVariants\s*:\s*\{([\s\S]*?)\}/;
  const match = code.match(defaultsPattern);
  if (!match) return defaults;

  const defaultsBlock = match[1];
  const valuePattern = /(\w+)\s*:\s*["'`](\w+)["'`]/g;
  let valueMatch;
  while ((valueMatch = valuePattern.exec(defaultsBlock)) !== null) {
    defaults[valueMatch[1]] = valueMatch[2];
  }

  return defaults;
}

/**
 * Checks if the component uses cn() utility
 */
function checkUsesCn(code: string): boolean {
  // Check for cn import
  const hasImport = /import\s*\{[^}]*\bcn\b[^}]*\}\s*from/.test(code);
  // Check for cn usage
  const hasUsage = /\bcn\s*\(/.test(code);
  return hasImport || hasUsage;
}

/**
 * Extracts forwardRef configuration
 */
function extractForwardRef(
  code: string
): ShadcnMetadata['forwardRef'] | undefined {
  // Match forwardRef pattern
  const forwardRefMatch = code.match(
    /React\.forwardRef|forwardRef/
  );
  if (!forwardRefMatch) return undefined;

  // Extract element type from forwardRef<ElementType, PropsType>
  const typeMatch = code.match(
    /forwardRef\s*<\s*([^,>]+)/
  );
  let elementType = 'HTMLElement';
  if (typeMatch) {
    elementType = normalizeElementType(typeMatch[1].trim());
  }

  // Extract ref parameter name
  const refParamMatch = code.match(
    /\(\s*\{[^}]*\}\s*,\s*(\w+)\s*\)/
  );
  const paramName = refParamMatch ? refParamMatch[1] : 'ref';

  return { elementType, paramName };
}

/**
 * Normalizes element type from React patterns to standard HTML types
 */
function normalizeElementType(rawType: string): string {
  // Already a standard HTML type
  if (rawType.startsWith('HTML') && rawType.endsWith('Element')) {
    return rawType;
  }

  // Handle React.ElementRef<typeof X>
  const elementRefMatch = rawType.match(
    /(?:React\.)?ElementRef\s*<\s*typeof\s+([^>]+)\s*>/
  );
  if (elementRefMatch) {
    return mapPrimitiveToElement(elementRefMatch[1].trim());
  }

  return 'HTMLElement';
}

/**
 * Maps Radix primitive names to HTML element types
 */
function mapPrimitiveToElement(primitive: string): string {
  const mappings: Record<string, string> = {
    // Common endings
    Root: 'HTMLDivElement',
    Trigger: 'HTMLButtonElement',
    Content: 'HTMLDivElement',
    Close: 'HTMLButtonElement',
    // Specific primitives
    'LabelPrimitive.Root': 'HTMLLabelElement',
    'SwitchPrimitive.Root': 'HTMLButtonElement',
    'CheckboxPrimitive.Root': 'HTMLButtonElement',
    'ProgressPrimitive.Root': 'HTMLDivElement',
    'SeparatorPrimitive.Root': 'HTMLDivElement',
  };

  // Check exact match
  if (mappings[primitive]) {
    return mappings[primitive];
  }

  // Check suffix
  const parts = primitive.split('.');
  const suffix = parts[parts.length - 1];
  if (mappings[suffix]) {
    return mappings[suffix];
  }

  return 'HTMLElement';
}

/**
 * Extracts and categorizes imports from source code
 */
function extractImports(code: string): ShadcnMetadata['imports'] {
  const imports: ShadcnMetadata['imports'] = [];

  // Match import statements
  const importPattern =
    /import\s+(?:(\w+)\s*,?\s*)?(?:\{([^}]+)\})?\s*from\s*["'`]([^"'`]+)["'`]/g;

  let match;
  while ((match = importPattern.exec(code)) !== null) {
    const defaultImport = match[1];
    const namedImports = match[2]
      ?.split(',')
      .map(s => s.trim().split(/\s+as\s+/)[0])
      .filter(Boolean);
    const source = match[3];

    imports.push({
      source,
      defaultImport,
      namedImports,
      category: categorizeImport(source),
    });
  }

  return imports;
}

/**
 * Categorizes an import by its source
 */
function categorizeImport(
  source: string
): 'react' | 'radix' | 'utility' | 'style' | 'icon' | 'other' {
  if (source === 'react' || source.startsWith('react-')) {
    return 'react';
  }
  if (source.startsWith('@radix-ui/')) {
    return 'radix';
  }
  if (source.includes('lucide') || source.includes('icon')) {
    return 'icon';
  }
  if (source.includes('utils') || source === 'clsx' || source === 'class-variance-authority') {
    return 'utility';
  }
  if (source.endsWith('.css') || source.endsWith('.scss')) {
    return 'style';
  }
  return 'other';
}

export default createShadcnPlugin;
