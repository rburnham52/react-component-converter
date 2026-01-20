import type { ExtendedMitosisComponent, SvelteCompilerOptions, PropDefinition } from '@component-converter/core';
/**
 * Generates the <script> block for a Svelte 5 component.
 * Uses runes: $props(), $state(), $derived(), $effect(), $bindable()
 */
export declare function generateSvelteScript(component: ExtendedMitosisComponent, props: PropDefinition[], options?: SvelteCompilerOptions): string;
//# sourceMappingURL=script.d.ts.map