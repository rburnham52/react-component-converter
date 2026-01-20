import type { RadixPrimitiveMapping } from '../types/shadcn-meta.js';
/**
 * Mapping of Radix UI primitives to Bits UI (Svelte) and Radix Vue equivalents.
 *
 * Svelte: Uses Bits UI (https://bits-ui.com) which provides Radix-like primitives
 * Vue: Uses Radix Vue (https://radix-vue.com) which is a direct port
 */
export declare const radixMappings: Record<string, RadixPrimitiveMapping>;
/**
 * Get the mapping for a specific Radix package
 */
export declare function getRadixMapping(packageName: string): RadixPrimitiveMapping | undefined;
/**
 * Get all Radix package names that have mappings
 */
export declare function getSupportedRadixPackages(): string[];
/**
 * Check if a package is a Radix package
 */
export declare function isRadixPackage(packageName: string): boolean;
//# sourceMappingURL=radix-primitives.d.ts.map