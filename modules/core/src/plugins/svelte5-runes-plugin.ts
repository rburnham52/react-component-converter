import type { MitosisComponent } from '@builder.io/mitosis';
import type { ConverterPlugin, PluginContext, Svelte5RunesPluginOptions } from '../types/plugins.js';
import type { ShadcnMetadata } from './shadcn-plugin.js';

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
export function createSvelte5RunesPlugin(
  options: Svelte5RunesPluginOptions = {}
): ConverterPlugin {
  const {
    useBindable = true,
    useState = true,
    useDerived = true,
    useEffect = true,
  } = options;

  return {
    name: 'svelte5-runes',
    order: 90, // Run late, after code generation

    postGenerate: async (code: string, component: MitosisComponent, context: PluginContext) => {
      if (context.target !== 'svelte') {
        return code;
      }

      let result = code;

      // Get shadcn metadata if available
      const shadcnMeta = context.metadata.shadcn as ShadcnMetadata | undefined;

      // Transform export let to $props()
      result = transformExportLetToProps(result, shadcnMeta, useBindable);

      // Transform reactive statements to $derived()
      if (useDerived) {
        result = transformReactiveToDerived(result);
      }

      // Transform state declarations to $state()
      if (useState) {
        result = transformStateDeclarations(result);
      }

      // Transform lifecycle hooks to $effect()
      if (useEffect) {
        result = transformLifecycleToEffect(result);
      }

      // Transform slot to @render children
      result = transformSlotToRender(result);

      // Add proper TypeScript imports
      result = addSvelteElementImports(result, shadcnMeta);

      return result;
    },
  };
}

/**
 * Transforms `export let prop` declarations to `$props()` destructuring
 */
function transformExportLetToProps(
  code: string,
  shadcnMeta: ShadcnMetadata | undefined,
  useBindable: boolean
): string {
  // Find all export let declarations in the script block
  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (!scriptMatch) return code;

  const scriptContent = scriptMatch[1];

  // Collect all export let props
  const exportLetPattern = /export\s+let\s+(\w+)(?:\s*:\s*([^=;]+))?(?:\s*=\s*([^;]+))?;?/g;
  const props: Array<{ name: string; type?: string; defaultValue?: string }> = [];

  let match;
  while ((match = exportLetPattern.exec(scriptContent)) !== null) {
    props.push({
      name: match[1],
      type: match[2]?.trim(),
      defaultValue: match[3]?.trim(),
    });
  }

  if (props.length === 0) return code;

  // Build $props() destructuring
  const propsEntries = props.map(p => {
    let entry = p.name;

    // Handle className -> class rename
    if (p.name === 'className') {
      entry = 'class: className';
    }

    // Add default value if present
    if (p.defaultValue) {
      entry += ` = ${p.defaultValue}`;
    }

    // Handle ref with $bindable()
    if (useBindable && p.name === 'ref') {
      entry = `ref = $bindable(null)`;
    }

    return entry;
  });

  // Add children and restProps
  propsEntries.push('children');
  propsEntries.push('...restProps');

  // Build Props interface
  const propsInterface = buildPropsInterface(props, shadcnMeta);

  // Build the new props declaration
  const propsDeclaration = `let { ${propsEntries.join(', ')} }: Props = $props();`;

  // Remove old export let declarations and add new ones
  let newScriptContent = scriptContent;
  newScriptContent = newScriptContent.replace(exportLetPattern, '');

  // Add Props interface and $props() after imports
  const importEndMatch = newScriptContent.match(/^([\s\S]*?)(import[^;]+;[\s\S]*?)(\n\n|\n(?=[^i]))/m);
  if (importEndMatch) {
    const beforeImports = importEndMatch[1];
    const imports = importEndMatch[2];
    const afterImports = newScriptContent.slice(importEndMatch[0].length);
    newScriptContent = `${beforeImports}${imports}\n\n${propsInterface}\n\n${propsDeclaration}\n${afterImports}`;
  } else {
    // No imports found, add at the beginning
    newScriptContent = `${propsInterface}\n\n${propsDeclaration}\n${newScriptContent}`;
  }

  // Clean up extra blank lines
  newScriptContent = newScriptContent.replace(/\n{3,}/g, '\n\n');

  return code.replace(scriptMatch[1], newScriptContent);
}

/**
 * Builds a TypeScript Props interface
 */
function buildPropsInterface(
  props: Array<{ name: string; type?: string; defaultValue?: string }>,
  shadcnMeta: ShadcnMetadata | undefined
): string {
  const lines: string[] = [];

  // Determine extends clause
  let extendsClause = '';
  if (shadcnMeta?.forwardRef) {
    const htmlType = getHtmlAttributesType(shadcnMeta.forwardRef.elementType);
    extendsClause = ` extends ${htmlType}`;
  }

  lines.push(`interface Props${extendsClause} {`);

  for (const prop of props) {
    if (prop.name === 'className') {
      lines.push(`  class?: string;`);
    } else if (prop.name === 'ref') {
      const elementType = shadcnMeta?.forwardRef?.elementType || 'HTMLElement';
      lines.push(`  ref?: ${elementType} | null;`);
    } else {
      const optional = prop.defaultValue ? '?' : '';
      const type = prop.type || 'unknown';
      lines.push(`  ${prop.name}${optional}: ${type};`);
    }
  }

  lines.push(`}`);

  return lines.join('\n');
}

/**
 * Gets the Svelte HTML attributes type for an element
 */
function getHtmlAttributesType(elementType: string): string {
  const mapping: Record<string, string> = {
    HTMLButtonElement: 'HTMLButtonAttributes',
    HTMLInputElement: 'HTMLInputAttributes',
    HTMLTextAreaElement: 'HTMLTextareaAttributes',
    HTMLSelectElement: 'HTMLSelectAttributes',
    HTMLAnchorElement: 'HTMLAnchorAttributes',
    HTMLFormElement: 'HTMLFormAttributes',
    HTMLImageElement: 'HTMLImgAttributes',
    HTMLLabelElement: 'HTMLLabelAttributes',
  };

  return mapping[elementType] || `HTMLAttributes<${elementType}>`;
}

/**
 * Transforms reactive statements to $derived()
 */
function transformReactiveToDerived(code: string): string {
  // $: derived = expression → let derived = $derived(expression)
  return code.replace(
    /\$:\s*(\w+)\s*=\s*([^;]+);/g,
    'let $1 = $derived($2);'
  );
}

/**
 * Transforms state declarations to $state()
 * Only transforms let declarations that look like state (not imports, not functions)
 */
function transformStateDeclarations(code: string): string {
  // This is a simplified transformation - in practice we'd need more context
  // to determine which variables are actually reactive state
  return code;
}

/**
 * Transforms lifecycle hooks to $effect()
 */
function transformLifecycleToEffect(code: string): string {
  // onMount(() => {...}) → $effect(() => {...})
  // afterUpdate(() => {...}) → $effect(() => {...})

  let result = code;

  // Transform afterUpdate
  result = result.replace(
    /afterUpdate\s*\(\s*\(\)\s*=>\s*\{/g,
    '$effect(() => {'
  );

  // Transform onMount (note: onMount runs once, $effect runs on every change)
  // This is a simplification - proper migration might need different handling
  result = result.replace(
    /onMount\s*\(\s*\(\)\s*=>\s*\{/g,
    '$effect(() => {'
  );

  // Remove lifecycle imports
  result = result.replace(
    /import\s*\{\s*(?:onMount|afterUpdate|onDestroy)(?:\s*,\s*(?:onMount|afterUpdate|onDestroy))*\s*\}\s*from\s*['"]svelte['"];?\n?/g,
    ''
  );

  return result;
}

/**
 * Transforms <slot /> to {@render children?.()}
 */
function transformSlotToRender(code: string): string {
  // <slot /> → {@render children?.()}
  // <slot></slot> → {@render children?.()}
  let result = code;

  result = result.replace(/<slot\s*\/>/g, '{@render children?.()}');
  result = result.replace(/<slot\s*><\/slot>/g, '{@render children?.()}');

  return result;
}

/**
 * Adds Svelte element type imports
 */
function addSvelteElementImports(
  code: string,
  shadcnMeta: ShadcnMetadata | undefined
): string {
  if (!shadcnMeta?.forwardRef) return code;

  const htmlType = getHtmlAttributesType(shadcnMeta.forwardRef.elementType);
  const importName = htmlType.includes('<') ? 'HTMLAttributes' : htmlType;

  // Check if import already exists
  if (code.includes(`import type { ${importName}`)) {
    return code;
  }

  // Add import after script tag
  const scriptMatch = code.match(/<script[^>]*>/);
  if (scriptMatch) {
    const insertPos = scriptMatch.index! + scriptMatch[0].length;
    const importStatement = `\nimport type { ${importName} } from "svelte/elements";`;
    return code.slice(0, insertPos) + importStatement + code.slice(insertPos);
  }

  return code;
}

export default createSvelte5RunesPlugin;
