import type { MitosisComponent } from '@builder.io/mitosis';

/**
 * Plugin context passed to all plugin hooks
 */
export interface PluginContext {
  /** Original source code */
  sourceCode: string;
  /** File path if available */
  filePath?: string;
  /** Target framework */
  target: 'svelte' | 'vue' | 'angular' | 'solid' | 'react';
  /** Additional metadata from previous plugins */
  metadata: Record<string, unknown>;
  /** Target component name (for multi-component files) */
  targetComponent?: string;
}

/**
 * Component Converter Plugin interface
 * Follows the Mitosis plugin pattern but with our own extensions
 */
export interface ConverterPlugin {
  /** Plugin identifier */
  name: string;

  /** Sort order - lower numbers run first */
  order?: number;

  /**
   * Pre-parse hook: Runs before Mitosis parseJsx()
   * Use this to transform source code before parsing
   */
  preParse?: (code: string, context: PluginContext) => string | Promise<string>;

  /**
   * Post-parse hook: Runs after Mitosis parseJsx()
   * Use this to modify the MitosisComponent IR
   */
  postParse?: (
    component: MitosisComponent,
    context: PluginContext
  ) => MitosisComponent | Promise<MitosisComponent>;

  /**
   * Pre-generate hook: Runs before calling Mitosis generators
   * Use this to add metadata or modify component before generation
   */
  preGenerate?: (
    component: MitosisComponent,
    context: PluginContext
  ) => MitosisComponent | Promise<MitosisComponent>;

  /**
   * Post-generate hook: Runs after Mitosis generators
   * Use this to transform the generated code (e.g., Svelte 5 runes)
   */
  postGenerate?: (
    code: string,
    component: MitosisComponent,
    context: PluginContext
  ) => string | Promise<string>;
}

/**
 * Built-in plugin for extracting CVA (Class Variance Authority) patterns
 */
export interface CvaPluginOptions {
  /** Whether to preserve CVA in output or inline classes */
  preserveCva?: boolean;
  /** Custom CVA import path for target framework */
  cvaImportPath?: string;
}

/**
 * Built-in plugin for handling cn() utility
 */
export interface CnPluginOptions {
  /** Custom cn() import path for target framework */
  cnImportPath?: string;
  /** Whether to add cn utility to output if not present */
  autoAddCn?: boolean;
}

/**
 * Built-in plugin for handling forwardRef
 */
export interface ForwardRefPluginOptions {
  /** How to handle refs in Svelte: 'bindable' for $bindable(), 'export' for export let */
  svelteRefStyle?: 'bindable' | 'export';
  /** How to handle refs in Vue: 'expose' for defineExpose(), 'ref' for template ref */
  vueRefStyle?: 'expose' | 'ref';
}

/**
 * Plugin for mapping React libraries to framework equivalents
 */
export interface LibraryMappingPluginOptions {
  /** Custom icon library mappings */
  iconMappings?: Record<string, { svelte: string; vue: string }>;
  /** Custom component library mappings (e.g., Radix -> Bits UI) */
  componentMappings?: Record<string, { svelte: string; vue: string }>;
}

/**
 * Options for the Svelte 5 runes transformation plugin
 */
export interface Svelte5RunesPluginOptions {
  /** Whether to use $bindable() for refs (default: true) */
  useBindable?: boolean;
  /** Whether to use $state() for reactive state (default: true) */
  useState?: boolean;
  /** Whether to use $derived() for computed values (default: true) */
  useDerived?: boolean;
  /** Whether to use $effect() for side effects (default: true) */
  useEffect?: boolean;
}

/**
 * Converter configuration
 */
export interface ConverterConfig {
  /** Plugins to apply (in order) */
  plugins?: ConverterPlugin[];
  /** Target framework */
  target: 'svelte' | 'vue';
  /** TypeScript output */
  typescript?: boolean;
  /** Format output with Prettier */
  format?: boolean;
  /** Framework-specific options */
  frameworkOptions?: SvelteFrameworkOptions | VueFrameworkOptions;
  /** Target component name (for multi-component files) */
  targetComponent?: string;
}

export interface SvelteFrameworkOptions {
  /** Svelte version (4 or 5) */
  version?: 4 | 5;
  /** Use runes mode for Svelte 5 */
  useRunes?: boolean;
  /** State type: 'proxies' or 'variables' */
  stateType?: 'proxies' | 'variables';
}

export interface VueFrameworkOptions {
  /** Vue version (default: 3) */
  version?: 3;
  /** API style: 'options' or 'composition' */
  api?: 'options' | 'composition';
  /** Use script setup (default: true) */
  scriptSetup?: boolean;
}

/**
 * Result of conversion
 */
export interface ConversionResult {
  /** Generated code */
  code: string;
  /** Filename for output */
  filename: string;
  /** Intermediate representation */
  ir: MitosisComponent;
  /** Any warnings during conversion */
  warnings: string[];
  /** Metadata collected by plugins */
  metadata: Record<string, unknown>;
}
