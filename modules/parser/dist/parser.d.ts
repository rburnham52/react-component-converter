import type { ParseResult, ParserOptions } from '@component-converter/core';
/**
 * Parses a React component file and returns the Mitosis IR with React-specific metadata.
 * Supports files with multiple component definitions (e.g., Card, CardHeader, CardContent, etc.)
 */
export declare function parseComponent(code: string, options?: ParserOptions): Promise<ParseResult>;
/**
 * Parses a component from a file path.
 */
export declare function parseComponentFile(filePath: string, options?: ParserOptions): Promise<ParseResult>;
//# sourceMappingURL=parser.d.ts.map