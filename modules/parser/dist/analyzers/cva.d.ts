import { SourceFile } from 'ts-morph';
import type { CvaConfig } from '@component-converter/core';
/**
 * Analyzes a source file to extract CVA (Class Variance Authority) configurations.
 *
 * CVA pattern example:
 * ```ts
 * const buttonVariants = cva("base-classes", {
 *   variants: {
 *     variant: { default: "...", destructive: "..." },
 *     size: { default: "...", sm: "...", lg: "..." }
 *   },
 *   defaultVariants: { variant: "default", size: "default" }
 * })
 * ```
 */
export declare function analyzeCva(sourceFile: SourceFile): CvaConfig | undefined;
/**
 * Analyzes a source file to extract ALL CVA configurations (for files with multiple CVAs).
 * Returns a map of CVA name to CvaConfig.
 */
export declare function analyzeAllCvaDefinitions(sourceFile: SourceFile): Record<string, CvaConfig>;
/**
 * Extracts the raw CVA call expression as a string for preservation.
 */
export declare function extractCvaSource(sourceFile: SourceFile): string | undefined;
//# sourceMappingURL=cva.d.ts.map