import type { ExtendedMitosisComponent, SvelteCompilerOptions, PropDefinition, ParseResult } from '@component-converter/core';
/**
 * Compiles an ExtendedMitosisComponent (Mitosis IR with React metadata) to Svelte 5.
 */
export declare function compileToSvelte(component: ExtendedMitosisComponent, props: PropDefinition[], options?: SvelteCompilerOptions): Promise<string>;
/**
 * Generates a complete Svelte component file from parsed component data.
 */
export declare function generateSvelteComponent(component: ExtendedMitosisComponent, props: PropDefinition[], options?: SvelteCompilerOptions): Promise<{
    code: string;
    filename: string;
}>;
/**
 * Compiles all components from a ParseResult to Svelte 5.
 * Returns a map of filename to code.
 */
export declare function compileAllToSvelte(parseResult: ParseResult, options?: SvelteCompilerOptions): Promise<Map<string, string>>;
/**
 * Compiles all components into a single file (for compound components like Card).
 */
export declare function compileAllToSingleFile(parseResult: ParseResult, options?: SvelteCompilerOptions): Promise<string>;
//# sourceMappingURL=compiler.d.ts.map