import type { MitosisComponent, MitosisNode } from '@builder.io/mitosis';

/**
 * CVA (Class Variance Authority) configuration extracted from a component
 */
export interface CvaConfig {
  /** The name of the variants function (e.g., "buttonVariants") */
  name: string;
  /** Base classes applied to all variants */
  baseClasses: string;
  /** Variant definitions: variant name -> variant value -> classes */
  variants: Record<string, Record<string, string>>;
  /** Default variant values */
  defaultVariants: Record<string, string>;
  /** Compound variants (optional) */
  compoundVariants?: Array<{
    conditions: Record<string, string>;
    classes: string;
  }>;
}

/**
 * forwardRef configuration extracted from a component
 */
export interface ForwardRefConfig {
  /** The HTML element type being ref'd (e.g., "HTMLButtonElement") */
  elementType: string;
  /** The parameter name used in forwardRef (e.g., "ref") */
  paramName: string;
}

/**
 * shadcn-specific metadata to extend Mitosis component.meta
 */
export interface ShadcnMeta {
  /** CVA variant configuration if the component uses CVA */
  cva?: CvaConfig;
  /** forwardRef configuration if the component uses forwardRef */
  forwardRef?: ForwardRefConfig;
  /** Whether the component uses the cn() utility for class merging */
  usesCn: boolean;
  /** Original imports that need framework-specific handling */
  originalImports: OriginalImport[];
}

/**
 * Import information from the original React component
 */
export interface OriginalImport {
  /** Module specifier (e.g., "@/lib/utils") */
  source: string;
  /** Named imports */
  namedImports?: string[];
  /** Default import name */
  defaultImport?: string;
  /** Category for transformation decisions */
  category: 'react' | 'radix' | 'utility' | 'style' | 'other';
}

/**
 * Extended Mitosis component with shadcn metadata
 */
export interface ShadcnComponent extends MitosisComponent {
  meta: MitosisComponent['meta'] & {
    shadcn?: ShadcnMeta;
  };
}

/**
 * Props definition extracted from the component
 */
export interface PropDefinition {
  /** Prop name */
  name: string;
  /** TypeScript type as string */
  type: string;
  /** Whether prop is optional */
  optional: boolean;
  /** Default value if any */
  defaultValue?: unknown;
  /** Whether this is a variant prop (from CVA) */
  isVariant: boolean;
  /** For variant props, the allowed values */
  allowedValues?: string[];
  /** JSDoc description */
  description?: string;
}

/**
 * A single component definition within a file
 */
export interface ComponentDefinition {
  /** Component name */
  name: string;
  /** The Mitosis component IR with shadcn metadata */
  component: ShadcnComponent;
  /** Extracted props definitions */
  props: PropDefinition[];
  /** Whether this is a simple re-export of a primitive */
  isReExport?: boolean;
  /** The primitive being re-exported if isReExport is true */
  reExportSource?: string;
  /** Base classes for the component */
  baseClasses?: string;
}

/**
 * Result of parsing a React shadcn component file (may contain multiple components)
 */
export interface ParseResult {
  /** The Mitosis component IR with shadcn metadata (primary/main component) */
  component: ShadcnComponent;
  /** All components defined in the file */
  components: ComponentDefinition[];
  /** Extracted props definitions (for primary component) */
  props: PropDefinition[];
  /** Any warnings during parsing */
  warnings: string[];
  /** Any errors during parsing (non-fatal) */
  errors: string[];
  /** Shared metadata across all components in the file */
  sharedMeta: {
    /** All CVA definitions in the file */
    cvaConfigs: Record<string, CvaConfig>;
    /** All imports */
    imports: OriginalImport[];
    /** Whether cn() is used */
    usesCn: boolean;
  };
}

/**
 * Options for the parser
 */
export interface ParserOptions {
  /** Whether to preserve original formatting hints */
  preserveFormatting?: boolean;
  /** Whether to extract JSDoc comments */
  extractJsDoc?: boolean;
  /** Custom cn() import path mapping */
  cnImportPath?: string;
}

/**
 * Options for compilers
 */
export interface CompilerOptions {
  /** Output TypeScript or JavaScript */
  typescript?: boolean;
  /** Format output with Prettier */
  format?: boolean;
  /** Custom cn() import path for target framework */
  cnImportPath?: string;
  /** Custom CVA import path */
  cvaImportPath?: string;
}

/**
 * Svelte-specific compiler options
 */
export interface SvelteCompilerOptions extends CompilerOptions {
  /** Svelte version: 4 or 5 (default: 5) */
  svelteVersion?: 4 | 5;
  /** Use runes mode for Svelte 5 (default: true) */
  useRunes?: boolean;
}

/**
 * Vue-specific compiler options
 */
export interface VueCompilerOptions extends CompilerOptions {
  /** Vue version (default: 3) */
  vueVersion?: 3;
  /** Use script setup (default: true) */
  scriptSetup?: boolean;
}

/**
 * Mapping of Radix UI primitives to target framework equivalents
 */
export interface RadixPrimitiveMapping {
  /** The Radix package (e.g., "@radix-ui/react-dialog") */
  radixPackage: string;
  /** Svelte equivalent package */
  sveltePackage?: string;
  /** Vue equivalent package */
  vuePackage?: string;
  /** Component mappings: Radix component -> target component */
  componentMap: Record<string, {
    svelte?: string;
    vue?: string;
    /** If the target uses different props, map them */
    propMap?: Record<string, string>;
    /** If the target doesn't have an equivalent, provide native HTML fallback */
    htmlFallback?: string;
  }>;
}

/**
 * Icon library mapping
 */
export interface IconMapping {
  /** Source package (e.g., "lucide-react") */
  source: string;
  /** Svelte equivalent */
  svelte: string;
  /** Vue equivalent */
  vue: string;
}
