import { SourceFile } from 'ts-morph';
import type { OriginalImport } from '@component-converter/core';
/**
 * Analyzes imports from a React component to categorize them
 * for framework-specific handling during compilation.
 */
export declare function analyzeImports(sourceFile: SourceFile): OriginalImport[];
/**
 * Checks if the component uses the cn() utility.
 */
export declare function usesCnUtility(sourceFile: SourceFile): boolean;
/**
 * Gets React-specific imports that need to be removed or transformed.
 */
export declare function getReactImports(sourceFile: SourceFile): OriginalImport[];
/**
 * Gets Radix UI imports that may need alternative handling.
 */
export declare function getRadixImports(sourceFile: SourceFile): OriginalImport[];
//# sourceMappingURL=imports.d.ts.map