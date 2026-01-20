export type { CvaConfig, ForwardRefConfig, ReactComponentMeta, ExtendedMitosisComponent, OriginalImport, PropDefinition, ComponentDefinition, ParseResult, ParserOptions, CompilerOptions, SvelteCompilerOptions, VueCompilerOptions, LibraryMapping, IconMapping, } from './types/component-meta.js';
export type { ConverterPlugin, PluginContext, ConverterConfig, ConversionResult, CvaPluginOptions, CnPluginOptions, ForwardRefPluginOptions, LibraryMappingPluginOptions, Svelte5RunesPluginOptions, SvelteFrameworkOptions, VueFrameworkOptions, } from './types/plugins.js';
export { convert, convertToSvelte, convertToVue, parseJsx, componentToSvelte, componentToVue, } from './converter.js';
export { createShadcnPlugin, createSvelte5RunesPlugin, type ShadcnPluginOptions, type ShadcnMetadata, } from './plugins/index.js';
export { cn, generateCnUtility, getCnImportPath } from './utils/cn.js';
export { radixMappings, getRadixMapping, getSupportedRadixPackages, isRadixPackage, iconMappings, getIconMapping, getSvelteIconPackage, getVueIconPackage, isIconPackage, transformIconImport, } from './mappings/index.js';
//# sourceMappingURL=index.d.ts.map