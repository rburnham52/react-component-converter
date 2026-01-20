import { parseJsx, componentToSvelte, componentToVue } from '@builder.io/mitosis';
import type { ConverterConfig, ConverterPlugin, ConversionResult } from './types/plugins.js';
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
export declare function convert(sourceCode: string, config: ConverterConfig): Promise<ConversionResult>;
/**
 * Convenience function to convert a React component to Svelte
 */
export declare function convertToSvelte(sourceCode: string, plugins?: ConverterPlugin[], options?: Partial<ConverterConfig>): Promise<ConversionResult>;
/**
 * Convenience function to convert a React component to Vue
 */
export declare function convertToVue(sourceCode: string, plugins?: ConverterPlugin[], options?: Partial<ConverterConfig>): Promise<ConversionResult>;
export { parseJsx, componentToSvelte, componentToVue };
//# sourceMappingURL=converter.d.ts.map