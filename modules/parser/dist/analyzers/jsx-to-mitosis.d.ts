import { Node, SourceFile } from 'ts-morph';
import type { MitosisNode } from '@builder.io/mitosis';
/**
 * Converts a ts-morph JSX node tree to Mitosis node format.
 * This allows us to use Mitosis generators while parsing standard React code.
 */
export declare function jsxToMitosisNodes(jsxNode: Node): MitosisNode[];
/**
 * Extracts the JSX return statement from a React component
 */
export declare function extractJsxFromComponent(componentCode: string, sourceFile: any): MitosisNode[];
/**
 * Extracts JSX for a specific named component in a multi-component file.
 * Handles forwardRef, arrow functions, and function declarations.
 */
export declare function extractJsxForNamedComponent(sourceFile: SourceFile, componentName: string): MitosisNode[];
//# sourceMappingURL=jsx-to-mitosis.d.ts.map