import type { ExtendedMitosisComponent, VueCompilerOptions, PropDefinition, ParseResult } from '@component-converter/core';
/**
 * Compiles a ExtendedMitosisComponent (Mitosis IR with React metadata) to Vue 3.
 */
export declare function compileToVue(component: ExtendedMitosisComponent, props: PropDefinition[], options?: VueCompilerOptions): Promise<string>;
/**
 * Generates a complete Vue component file from parsed component data.
 */
export declare function generateVueComponent(component: ExtendedMitosisComponent, props: PropDefinition[], options?: VueCompilerOptions): Promise<{
    code: string;
    filename: string;
}>;
/**
 * Compiles all components from a ParseResult to Vue 3.
 * Returns a map of filename to code.
 */
export declare function compileAllToVue(parseResult: ParseResult, options?: VueCompilerOptions): Promise<Map<string, string>>;
//# sourceMappingURL=compiler.d.ts.map