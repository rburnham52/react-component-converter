import { Command } from 'commander';
/**
 * Creates the 'convert' command that directly converts React TSX to Svelte or Vue.
 *
 * This command uses the custom parser (which handles standard React patterns like
 * forwardRef, CVA, cn) combined with the custom compilers that generate proper
 * Svelte 5 runes and Vue 3 Composition API code.
 *
 * Architecture:
 * - Parser: Uses ts-morph to analyze React TSX, extracting CVA, forwardRef, cn patterns
 * - Compiler: Generates Svelte 5 runes ($props, $bindable) or Vue 3 Composition API
 *
 * Note: The new Mitosis-based plugin architecture in @component-converter/core is
 * available for Mitosis-format components. For standard React components, this
 * custom parser/compiler pipeline provides better support.
 */
export declare function createConvertCommand(): Command;
//# sourceMappingURL=convert.d.ts.map