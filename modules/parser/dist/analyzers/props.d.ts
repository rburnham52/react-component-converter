import { SourceFile } from 'ts-morph';
import type { PropDefinition, CvaConfig } from '@component-converter/core';
/**
 * Analyzes a source file to extract component props definitions.
 * Looks for interfaces/types ending with "Props" (e.g., ButtonProps).
 */
export declare function analyzeProps(sourceFile: SourceFile, cvaConfig?: CvaConfig): PropDefinition[];
/**
 * Gets the props interface/type name from the source file.
 */
export declare function getPropsTypeName(sourceFile: SourceFile): string | undefined;
//# sourceMappingURL=props.d.ts.map