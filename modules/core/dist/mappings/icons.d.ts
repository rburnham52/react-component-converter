import type { IconMapping } from '../types/shadcn-meta.js';
/**
 * Icon library mappings from React to Svelte/Vue equivalents
 */
export declare const iconMappings: IconMapping[];
/**
 * Get the icon mapping for a specific source package
 */
export declare function getIconMapping(sourcePackage: string): IconMapping | undefined;
/**
 * Get the Svelte equivalent icon package
 */
export declare function getSvelteIconPackage(sourcePackage: string): string | undefined;
/**
 * Get the Vue equivalent icon package
 */
export declare function getVueIconPackage(sourcePackage: string): string | undefined;
/**
 * Check if a package is an icon library
 */
export declare function isIconPackage(packageName: string): boolean;
/**
 * Transform an icon import for the target framework
 */
export declare function transformIconImport(sourcePackage: string, iconNames: string[], target: 'svelte' | 'vue'): {
    package: string;
    icons: string[];
} | undefined;
//# sourceMappingURL=icons.d.ts.map