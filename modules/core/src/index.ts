// ============================================================================
// Component Types (Generic - work with any React component)
// ============================================================================
export type {
  CvaConfig,
  ForwardRefConfig,
  ReactComponentMeta,
  ExtendedMitosisComponent,
  OriginalImport,
  PropDefinition,
  ComponentDefinition,
  ParseResult,
  ParserOptions,
  CompilerOptions,
  SvelteCompilerOptions,
  VueCompilerOptions,
  LibraryMapping,
  IconMapping,
} from './types/component-meta.js';

// ============================================================================
// Plugin-based Types
// ============================================================================
export type {
  ConverterPlugin,
  PluginContext,
  ConverterConfig,
  ConversionResult,
  CvaPluginOptions,
  CnPluginOptions,
  ForwardRefPluginOptions,
  LibraryMappingPluginOptions,
  Svelte5RunesPluginOptions,
  SvelteFrameworkOptions,
  VueFrameworkOptions,
} from './types/plugins.js';

// ============================================================================
// Converter API (Mitosis-based)
// ============================================================================
export {
  convert,
  convertToSvelte,
  convertToVue,
  parseJsx,
  componentToSvelte,
  componentToVue,
} from './converter.js';

// ============================================================================
// Plugins
// ============================================================================
export {
  createShadcnPlugin,
  createSvelte5RunesPlugin,
  type ShadcnPluginOptions,
  type ShadcnMetadata,
} from './plugins/index.js';

// ============================================================================
// Utilities
// ============================================================================
export { cn, generateCnUtility, getCnImportPath } from './utils/cn.js';

// ============================================================================
// Library Mappings (Radix, Icons, etc.)
// ============================================================================
export {
  radixMappings,
  getRadixMapping,
  getSupportedRadixPackages,
  isRadixPackage,
  iconMappings,
  getIconMapping,
  getSvelteIconPackage,
  getVueIconPackage,
  isIconPackage,
  transformIconImport,
  // Radix primitive props
  radixPrimitiveProps,
  getRadixPrimitiveProps,
  getSupportedRadixPackagesWithProps,
  hasStateProp,
  getStatePropInfo,
  type RadixPropDefinition,
  type RadixPrimitivePropsConfig,
} from './mappings/index.js';
