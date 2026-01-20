import type { ConverterPlugin, CvaPluginOptions, CnPluginOptions, ForwardRefPluginOptions } from '../types/plugins.js';
/**
 * Combined options for the shadcn plugin
 */
export interface ShadcnPluginOptions extends CvaPluginOptions, CnPluginOptions, ForwardRefPluginOptions {
}
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
 */
export declare function createShadcnPlugin(options?: ShadcnPluginOptions): ConverterPlugin;
export default createShadcnPlugin;
//# sourceMappingURL=shadcn-plugin.d.ts.map