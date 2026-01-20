import type { ConverterPlugin, Svelte5RunesPluginOptions } from '../types/plugins.js';
/**
 * Creates a Svelte 5 runes transformation plugin.
 *
 * Mitosis outputs Svelte 4 syntax by default. This plugin transforms
 * the generated code to use Svelte 5 runes:
 * - `export let prop` → `let { prop } = $props()`
 * - `let state = value` → `let state = $state(value)`
 * - `$: derived = expr` → `let derived = $derived(expr)`
 * - `afterUpdate(() => {})` → `$effect(() => {})`
 * - Adds `$bindable()` for ref props
 */
export declare function createSvelte5RunesPlugin(options?: Svelte5RunesPluginOptions): ConverterPlugin;
export default createSvelte5RunesPlugin;
//# sourceMappingURL=svelte5-runes-plugin.d.ts.map