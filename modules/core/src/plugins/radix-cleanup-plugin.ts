import type { MitosisComponent } from '@builder.io/mitosis';
import type { ConverterPlugin, PluginContext } from '../types/plugins.js';

/**
 * Mapping of Radix primitive components to HTML elements.
 * This allows generated Vue/Svelte code to use native elements
 * instead of Radix React primitives.
 */
const RADIX_TO_HTML_MAP: Record<string, string> = {
  // Label
  'LabelPrimitive.Root': 'label',

  // Avatar
  'AvatarPrimitive.Root': 'span',
  'AvatarPrimitive.Image': 'img',
  'AvatarPrimitive.Fallback': 'span',

  // Separator
  'SeparatorPrimitive.Root': 'div',

  // Progress
  'ProgressPrimitive.Root': 'div',
  'ProgressPrimitive.Indicator': 'div',

  // Checkbox (simplified - real impl needs more logic)
  'CheckboxPrimitive.Root': 'button',
  'CheckboxPrimitive.Indicator': 'span',

  // Switch
  'SwitchPrimitives.Root': 'button',
  'SwitchPrimitive.Root': 'button',
  'SwitchPrimitives.Thumb': 'span',
  'SwitchPrimitive.Thumb': 'span',

  // Tabs
  'TabsPrimitive.Root': 'div',
  'TabsPrimitive.List': 'div',
  'TabsPrimitive.Trigger': 'button',
  'TabsPrimitive.Content': 'div',

  // Dialog
  'DialogPrimitive.Root': 'div',
  'DialogPrimitive.Trigger': 'button',
  'DialogPrimitive.Portal': 'div',
  'DialogPrimitive.Overlay': 'div',
  'DialogPrimitive.Content': 'div',
  'DialogPrimitive.Close': 'button',
  'DialogPrimitive.Title': 'h2',
  'DialogPrimitive.Description': 'p',

  // Popover
  'PopoverPrimitive.Root': 'div',
  'PopoverPrimitive.Trigger': 'button',
  'PopoverPrimitive.Content': 'div',
  'PopoverPrimitive.Portal': 'div',
  'PopoverPrimitive.Anchor': 'div',

  // Tooltip
  'TooltipPrimitive.Provider': 'div',
  'TooltipPrimitive.Root': 'div',
  'TooltipPrimitive.Trigger': 'button',
  'TooltipPrimitive.Content': 'div',
  'TooltipPrimitive.Portal': 'div',

  // Accordion
  'AccordionPrimitive.Root': 'div',
  'AccordionPrimitive.Item': 'div',
  'AccordionPrimitive.Header': 'h3',
  'AccordionPrimitive.Trigger': 'button',
  'AccordionPrimitive.Content': 'div',

  // Dropdown Menu
  'DropdownMenuPrimitive.Root': 'div',
  'DropdownMenuPrimitive.Trigger': 'button',
  'DropdownMenuPrimitive.Portal': 'div',
  'DropdownMenuPrimitive.Content': 'div',
  'DropdownMenuPrimitive.Item': 'div',
  'DropdownMenuPrimitive.CheckboxItem': 'div',
  'DropdownMenuPrimitive.RadioItem': 'div',
  'DropdownMenuPrimitive.Label': 'div',
  'DropdownMenuPrimitive.Separator': 'div',
  'DropdownMenuPrimitive.Sub': 'div',
  'DropdownMenuPrimitive.SubTrigger': 'div',
  'DropdownMenuPrimitive.SubContent': 'div',
  'DropdownMenuPrimitive.ItemIndicator': 'span',

  // Slider
  'SliderPrimitive.Root': 'div',
  'SliderPrimitive.Track': 'div',
  'SliderPrimitive.Range': 'div',
  'SliderPrimitive.Thumb': 'span',
};

/**
 * Creates a plugin that cleans up Radix primitive imports and replaces
 * them with native HTML elements in the generated Vue/Svelte code.
 */
export function createRadixCleanupPlugin(): ConverterPlugin {
  return {
    name: 'radix-cleanup',
    order: 90, // Run late, after other transformations

    postGenerate: async (
      code: string,
      component: MitosisComponent,
      context: PluginContext
    ): Promise<string> => {
      let result = code;

      // Remove Radix primitive imports
      // Vue: import * as XPrimitive from '@radix-ui/react-x';
      // Svelte: import * as XPrimitive from '@radix-ui/react-x';
      result = result.replace(
        /import\s+\*\s+as\s+\w+Primitives?\s+from\s+['"]@radix-ui\/react-[^'"]+['"]\s*;?\n?/g,
        ''
      );

      // Transform lucide-react to target framework's icon library
      if (context.target === 'vue') {
        result = result.replace(
          /from\s+['"]lucide-react['"]/g,
          "from 'lucide-vue-next'"
        );
      } else if (context.target === 'svelte') {
        result = result.replace(
          /from\s+['"]lucide-react['"]/g,
          "from 'lucide-svelte'"
        );
      }

      if (context.target === 'vue') {
        // Convert className to class for Vue
        result = result.replace(/:className=/g, ':class=');
        result = result.replace(/\bclassName=/g, 'class=');

        // Remove leftover XPrimitive variable assignments like: const Tabs = TabsPrimitive.Root;
        result = result.replace(/const\s+\w+\s*=\s*\w+Primitives?\.\w+\s*;?\n?/g, '');

        // Remove React-specific interface/type definitions that extend React types
        result = result.replace(/export\s+interface\s+\w+Props[\s\S]*?extends[\s\S]*?React\.[^{]+\{[^}]*\}\n?/g, '');

        // Remove VariantProps from imports for Vue as well (it's a TypeScript type)
        result = result.replace(
          /import\s*\{\s*([^}]*),\s*VariantProps\s*\}\s*from\s*['"]class-variance-authority['"]/g,
          (match, otherImports) => {
            const cleaned = otherImports.trim().replace(/,\s*$/, '');
            if (cleaned) {
              return `import { ${cleaned} } from 'class-variance-authority'`;
            }
            return '';
          }
        );
        result = result.replace(
          /import\s*\{\s*VariantProps\s*,\s*([^}]*)\}\s*from\s*['"]class-variance-authority['"]/g,
          (match, otherImports) => {
            const cleaned = otherImports.trim().replace(/,\s*$/, '');
            if (cleaned) {
              return `import { ${cleaned} } from 'class-variance-authority'`;
            }
            return '';
          }
        );

        // Extract props used in template and add defineProps
        const templateMatch2 = result.match(/<template>([\s\S]*?)<\/template>/);
        const scriptMatch = result.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        if (templateMatch2 && scriptMatch) {
          const template = templateMatch2[1];
          const script = scriptMatch[0];

          // Find props used in template (simple identifiers not preceded by . and not part of function calls)
          // Look for common props like variant, size, className, type, value, etc.
          const commonProps = ['variant', 'size', 'className', 'type', 'value', 'disabled', 'checked', 'decorative', 'orientation', 'asChild'];
          const usedProps: string[] = [];

          for (const prop of commonProps) {
            // Check if prop is used in template (as a standalone identifier in an expression)
            const propPattern = new RegExp(`\\b${prop}\\b(?!\\s*[:(])`, 'g');
            if (propPattern.test(template)) {
              usedProps.push(prop);
            }
          }

          // Check if defineProps already exists
          if (usedProps.length > 0 && !script.includes('defineProps')) {
            // Create defineProps call
            const propsWithDefaults = usedProps.map(p => {
              if (p === 'variant') return `  ${p}: { type: String, default: 'default' }`;
              if (p === 'size') return `  ${p}: { type: String, default: 'default' }`;
              if (p === 'orientation') return `  ${p}: { type: String, default: 'horizontal' }`;
              if (p === 'type') return `  ${p}: { type: String, default: 'text' }`;
              if (p === 'decorative') return `  ${p}: { type: Boolean, default: false }`;
              if (p === 'disabled') return `  ${p}: { type: Boolean, default: false }`;
              if (p === 'checked') return `  ${p}: { type: Boolean, default: false }`;
              if (p === 'asChild') return `  ${p}: { type: Boolean, default: false }`;
              return `  ${p}: { type: String, default: undefined }`;
            }).join(',\n');

            const definePropsCall = `const { ${usedProps.join(', ')} } = defineProps({\n${propsWithDefaults}\n});\n`;

            // Insert after <script setup lang="ts">
            result = result.replace(
              /(<script[^>]*>)\n/,
              `$1\n${definePropsCall}`
            );
          }
        }

        // Use a stack-based approach to properly match opening and closing component tags
        // This handles nested components of different types correctly

        // Parse through the template section
        const templateMatch = result.match(/<template>([\s\S]*?)<\/template>/);
        if (templateMatch) {
          const beforeTemplate = result.substring(0, result.indexOf('<template>'));
          const afterTemplate = result.substring(result.indexOf('</template>') + '</template>'.length);
          let template = templateMatch[1];

          // Build a map of opening tag positions to their HTML element replacements
          const openingTags: Array<{ pos: number; length: number; htmlElement: string; attrs: string }> = [];

          for (const [primitive, htmlElement] of Object.entries(RADIX_TO_HTML_MAP)) {
            const openPattern = new RegExp(
              `<component([^>]*):is=["']${escapeRegex(primitive)}["']([^>]*)>`,
              'g'
            );

            let match;
            while ((match = openPattern.exec(template)) !== null) {
              openingTags.push({
                pos: match.index,
                length: match[0].length,
                htmlElement,
                attrs: (match[1] || '') + (match[2] || ''),
              });
            }
          }

          // Sort by position
          openingTags.sort((a, b) => a.pos - b.pos);

          if (openingTags.length > 0) {
            // Now process the template with a stack to match opening/closing tags
            const stack: string[] = [];
            let newTemplate = '';
            let i = 0;
            let tagIndex = 0;

            while (i < template.length) {
              // Check if we're at an opening tag position
              if (tagIndex < openingTags.length && i === openingTags[tagIndex].pos) {
                const tag = openingTags[tagIndex];
                newTemplate += `<${tag.htmlElement}${tag.attrs}>`;
                stack.push(tag.htmlElement);
                i += tag.length;
                tagIndex++;
                continue;
              }

              // Check for closing component tag - may be split across lines as </component\n  >
              if (template.substring(i, i + 11) === '</component') {
                // Find the closing > which may have whitespace before it
                let j = i + 11;
                while (j < template.length && /\s/.test(template[j])) {
                  j++;
                }
                if (template[j] === '>') {
                  if (stack.length > 0) {
                    const htmlElement = stack.pop()!;
                    newTemplate += `</${htmlElement}>`;
                    i = j + 1;
                    continue;
                  }
                }
              }

              newTemplate += template[i];
              i++;
            }

            template = newTemplate;
            result = beforeTemplate + '<template>' + template + '</template>' + afterTemplate;
          }
        }

        // Fix void elements that shouldn't have closing tags (must be done after template processing)
        const voidElements = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];
        for (const element of voidElements) {
          // Remove closing tags for void elements: </img> -> empty
          result = result.replace(new RegExp(`</${element}>`, 'gi'), '');
        }

        // Add <slot></slot> to elements that should have children
        // Match elements like <button ...></button> or <div ...></div> and add <slot></slot> inside
        // Only do this for elements that are likely to have children content
        const elementsWithSlots = ['button', 'div', 'span', 'label', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th', 'li', 'table', 'thead', 'tbody', 'tr', 'caption'];
        for (const element of elementsWithSlots) {
          // Match empty tags: <element attrs></element> (with possible whitespace/newlines between)
          // But NOT self-closing or tags with content
          const emptyTagPattern = new RegExp(
            `(<${element}\\b[^>]*>)(\\s*)(</${element}>)`,
            'gi'
          );
          result = result.replace(emptyTagPattern, `$1$2<slot></slot>$3`);
        }

        // Fix Vue prop spreading: use $attrs instead of $props
        // $props contains ALL defined props including variant, size, className which shouldn't be HTML attrs
        // $attrs contains fallthrough attributes like disabled, onClick, etc.
        result = result.replace(/v-bind="\$props"/g, 'v-bind="$attrs"');

        // Fix Progress indicator - Mitosis loses the class on the inner div
        // Pattern: <div :style="{ transform: `translateX(-${100 - (value || 0)}%)` }">
        // Should have class="h-full w-full flex-1 bg-primary transition-all"
        result = result.replace(
          /(<div\s+):style="\{\s*transform:\s*`translateX\(-\$\{100 - \(value \|\| 0\)\}%\)`[^}]*\}"\s*>/g,
          '$1class="h-full w-full flex-1 bg-primary transition-all" :style="{ transform: `translateX(-${100 - (value || 0)}%)` }">'
        );

        // Fix Switch component - add data-state attribute and fix thumb positioning
        // The data-[state=checked/unchecked] classes need the data-state attribute to work
        if (result.includes('data-[state=checked]:bg-primary') && result.includes('data-[state=unchecked]:bg-input')) {
          // This is a Switch component - add data-state binding to the button
          result = result.replace(
            /(<button\s+)(:class="[^"]*data-\[state=checked\]:bg-primary[^"]*")/g,
            '$1:data-state="checked ? \'checked\' : \'unchecked\'" $2'
          );
          // Also add data-state to the thumb span for translate
          result = result.replace(
            /(<span\s+)(:class="[^"]*data-\[state=checked\]:translate-x-5[^"]*")/g,
            '$1:data-state="checked ? \'checked\' : \'unchecked\'" $2'
          );
          // Remove the slot from Switch thumb - it shouldn't have children
          result = result.replace(
            /(<span[^>]*:class="[^"]*pointer-events-none block h-5 w-5 rounded-full[^"]*"[^>]*>)<slot><\/slot>(<\/span>)/g,
            '$1$2'
          );
        }

        // Fix Checkbox component - add data-state attribute and conditionally show indicator
        if (result.includes('data-[state=checked]:bg-primary') && result.includes('grid place-content-center peer h-4 w-4')) {
          // This is a Checkbox component - add data-state binding
          result = result.replace(
            /(<button\s+[^>]*?)(:class="[^"]*data-\[state=checked\]:bg-primary[^"]*text-primary-foreground[^"]*")/g,
            '$1:data-state="checked ? \'checked\' : \'unchecked\'" $2'
          );
          // Wrap the indicator span with v-if="checked" - handle multiline class attribute
          result = result.replace(
            /<span\s+:class="cn\('grid place-content-center text-current'\)"/g,
            '<span v-if="checked" :class="cn(\'grid place-content-center text-current\')"'
          );
        }
      } else if (context.target === 'svelte') {
        // Remove VariantProps from imports - it's a TypeScript type-only export that doesn't exist at runtime
        // import { cva, VariantProps } from 'class-variance-authority' -> import { cva } from 'class-variance-authority'
        result = result.replace(
          /import\s*\{\s*([^}]*),\s*VariantProps\s*\}\s*from\s*['"]class-variance-authority['"]/g,
          (match, otherImports) => {
            const cleaned = otherImports.trim().replace(/,\s*$/, '');
            if (cleaned) {
              return `import { ${cleaned} } from 'class-variance-authority'`;
            }
            return '';
          }
        );
        // Also handle case where VariantProps comes first
        result = result.replace(
          /import\s*\{\s*VariantProps\s*,\s*([^}]*)\}\s*from\s*['"]class-variance-authority['"]/g,
          (match, otherImports) => {
            const cleaned = otherImports.trim().replace(/,\s*$/, '');
            if (cleaned) {
              return `import { ${cleaned} } from 'class-variance-authority'`;
            }
            return '';
          }
        );
        // Handle standalone VariantProps import
        result = result.replace(
          /import\s*\{\s*VariantProps\s*\}\s*from\s*['"]class-variance-authority['"];\n?/g,
          ''
        );
        // Also handle type import
        result = result.replace(
          /import\s+type\s*\{\s*VariantProps\s*\}\s*from\s*['"]class-variance-authority['"];\n?/g,
          ''
        );

        // Remove leftover XPrimitive variable assignments
        result = result.replace(/const\s+\w+\s*=\s*\w+Primitives?\.\w+\s*;?\n?/g, '');

        // Remove React-specific interface definitions from Svelte module context
        // Matches: export interface XProps extends React.Y, VariantProps<...> { ... }
        result = result.replace(
          /<script context="module"[^>]*>[\s\S]*?export\s+interface\s+\w+Props[\s\S]*?<\/script>\n?/g,
          ''
        );

        // Extract props used in markup and add them as let declarations
        // Look for common props: variant, size, className
        const markupMatch = result.match(/<\/script>\s*([\s\S]*)$/);
        const scriptTagMatch = result.match(/<script lang="ts">([\s\S]*?)<\/script>/);
        if (markupMatch && scriptTagMatch) {
          const markup = markupMatch[1];
          const scriptContent = scriptTagMatch[1];

          const commonProps = ['variant', 'size', 'className', 'type', 'value', 'disabled', 'checked', 'decorative', 'orientation', 'asChild'];
          const propsToAdd: string[] = [];

          for (const prop of commonProps) {
            // Check if prop is used in the markup
            const propPattern = new RegExp(`\\b${prop}\\b`, 'g');
            if (propPattern.test(markup)) {
              // Check if it's not already declared in script
              const declPattern = new RegExp(`(let|const|var)\\s+${prop}\\b`, 'g');
              if (!declPattern.test(scriptContent)) {
                if (prop === 'variant') {
                  propsToAdd.push(`  export let ${prop}: string = 'default';`);
                } else if (prop === 'size') {
                  propsToAdd.push(`  export let ${prop}: string = 'default';`);
                } else if (prop === 'orientation') {
                  propsToAdd.push(`  export let ${prop}: string = 'horizontal';`);
                } else if (prop === 'type') {
                  propsToAdd.push(`  export let ${prop}: string = 'text';`);
                } else if (prop === 'className') {
                  propsToAdd.push(`  export let ${prop}: string | undefined = undefined;`);
                } else if (['disabled', 'checked', 'decorative', 'asChild'].includes(prop)) {
                  propsToAdd.push(`  export let ${prop}: boolean = false;`);
                } else {
                  propsToAdd.push(`  export let ${prop}: string | undefined = undefined;`);
                }
              }
            }
          }

          if (propsToAdd.length > 0) {
            // Insert after the opening <script> tag
            result = result.replace(
              /(<script lang="ts">)\n/,
              `$1\n${propsToAdd.join('\n')}\n`
            );
          }
        }

        // For Svelte, use stack-based approach similar to Vue
        // Svelte uses <svelte:component this={XPrimitive.Y}>

        // Build a map of opening tag positions to their HTML element replacements
        const openingTags: Array<{ pos: number; length: number; htmlElement: string; attrs: string; selfClosing: boolean }> = [];

        for (const [primitive, htmlElement] of Object.entries(RADIX_TO_HTML_MAP)) {
          // Match: <svelte:component ... this={XPrimitive.Y} ...> or <svelte:component ... this={XPrimitive.Y} ... />
          const openPattern = new RegExp(
            `<svelte:component([^>]*)this=\\{${escapeRegex(primitive)}\\}([^>]*?)(\\/?)>`,
            'g'
          );

          let match;
          while ((match = openPattern.exec(result)) !== null) {
            openingTags.push({
              pos: match.index,
              length: match[0].length,
              htmlElement,
              attrs: (match[1] || '') + (match[2] || ''),
              selfClosing: match[3] === '/',
            });
          }
        }

        // Sort by position
        openingTags.sort((a, b) => a.pos - b.pos);

        if (openingTags.length > 0) {
          // Process with stack to match opening/closing tags
          const stack: string[] = [];
          let newResult = '';
          let i = 0;
          let tagIndex = 0;

          while (i < result.length) {
            // Check if we're at an opening tag position
            if (tagIndex < openingTags.length && i === openingTags[tagIndex].pos) {
              const tag = openingTags[tagIndex];
              // Clean up attributes - remove empty strings and fix className
              let attrs = tag.attrs.replace(/\s+/g, ' ').trim();
              // Convert className to class for Svelte
              attrs = attrs.replace(/\bclassName=/g, 'class=');

              if (tag.selfClosing) {
                // Self-closing tag - output with />
                newResult += `<${tag.htmlElement}${attrs ? ' ' + attrs : ''} />`;
              } else {
                // Regular opening tag - push to stack
                newResult += `<${tag.htmlElement}${attrs ? ' ' + attrs : ''}>`;
                stack.push(tag.htmlElement);
              }
              i += tag.length;
              tagIndex++;
              continue;
            }

            // Check for closing svelte:component tag - may be split with whitespace
            if (result.substring(i, i + 18) === '</svelte:component') {
              // Find the closing >
              let j = i + 18;
              while (j < result.length && /\s/.test(result[j])) {
                j++;
              }
              if (result[j] === '>') {
                if (stack.length > 0) {
                  const htmlElement = stack.pop()!;
                  newResult += `</${htmlElement}>`;
                  i = j + 1;
                  continue;
                }
              }
            }

            newResult += result[i];
            i++;
          }

          result = newResult;
        }

        // Also convert className to class in the rest of the code
        result = result.replace(/\bclassName=/g, 'class=');

        // Fix self-closing tags for non-void elements in Svelte 5
        // Elements like button, div, span, label, etc. can't be self-closing
        const nonVoidElements = [
          'button', 'div', 'span', 'label', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'section', 'article', 'header', 'footer', 'nav', 'main', 'aside',
          'ul', 'ol', 'li', 'dl', 'dt', 'dd',
          'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
          'form', 'fieldset', 'legend', 'select', 'option', 'optgroup', 'textarea',
          'pre', 'code', 'blockquote', 'figure', 'figcaption',
          'details', 'summary', 'dialog', 'menu'
        ];

        for (const element of nonVoidElements) {
          // Match self-closing tags: <element ... />
          const selfClosingPattern = new RegExp(
            `<${element}(\\s[^>]*)\\s*\\/>`,
            'g'
          );
          result = result.replace(selfClosingPattern, `<${element}$1></${element}>`);
        }

        // Fix import path from @/lib/utils to $lib/utils for SvelteKit
        // Preserve the original quote style
        result = result.replace(/from\s+'@\/lib\//g, "from '$lib/");
        result = result.replace(/from\s+"@\/lib\//g, 'from "$lib/');

        // Add <slot /> to elements that should have children
        // Match elements like <button ...></button> or <div ...></div> and add <slot /> inside
        const elementsWithSlots = ['button', 'div', 'span', 'label', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th', 'li', 'table', 'thead', 'tbody', 'tr', 'caption'];
        for (const element of elementsWithSlots) {
          // Match empty tags: <element attrs></element> (with possible whitespace/newlines between)
          const emptyTagPattern = new RegExp(
            `(<${element}\\b[^>]*>)(\\s*)(</${element}>)`,
            'gi'
          );
          result = result.replace(emptyTagPattern, `$1$2<slot />$3`);
        }

        // Fix Svelte class/props order - class should come AFTER {...$$props} to not be overridden
        // Pattern: {...$$props} class={...} -> already correct
        // Pattern: class={...} {...$$props} -> needs reorder
        // But actually the issue is when class comes after $$props on same line
        // For Skeleton specifically: <div {...$$props} class=...> works but we need slot
        // The real fix is ensuring elements that need children have slots

        // Remove <slot /> from inside Switch thumb span - it's self-contained
        // The thumb span should not have children
        result = result.replace(
          /(<span[^>]*class=\{cn\(\s*['"]pointer-events-none block h-5 w-5 rounded-full[^>]*>)<slot\s*\/?>(<\/span>)/g,
          '$1$2'
        );

        // Fix Svelte class prop handling
        // In Svelte, when parent passes class="...", it goes into $$props.class
        // We need to use $$restProps to avoid class being applied twice
        // $$restProps excludes explicitly exported props, so class gets handled properly
        // Note: In JS replace(), $$ is an escape for single $, so use $$$$ to get $$
        result = result.replace(/\{\.\.\.\$\$props\}/g, '{...$$$$restProps}');

        // For components using className prop, also capture class from parent
        // Add: $: mergedClass = $$props.class; after the export let className line
        if (result.includes('export let className')) {
          result = result.replace(
            /(export let className[^;]*;)/g,
            '$1\n  $$: mergedClass = $$$$props.class;'
          );
          // Update cn() calls to use mergedClass as fallback
          result = result.replace(
            /cn\(([^)]+),\s*className\)/g,
            'cn($1, mergedClass || className)'
          );
        }

        // Fix Switch component - add data-state attribute for Svelte
        if (result.includes('data-[state=checked]:bg-primary') && result.includes('data-[state=unchecked]:bg-input')) {
          // Add data-state to the button
          result = result.replace(
            /(<button\s+)(class=\{cn\(\s*['"]peer inline-flex h-6 w-11)/g,
            '$1data-state={checked ? "checked" : "unchecked"}\n  $2'
          );
          // Add data-state to the thumb span
          result = result.replace(
            /(<span\s+)(class=\{cn\(\s*['"]pointer-events-none block h-5 w-5 rounded-full)/g,
            '$1data-state={checked ? "checked" : "unchecked"}\n    $2'
          );
        }

        // Fix Checkbox component - add data-state and conditional indicator for Svelte
        if (result.includes('data-[state=checked]:bg-primary') && result.includes('grid place-content-center peer h-4 w-4')) {
          // Add data-state to the button
          result = result.replace(
            /(<button\s+)(bind:this=\{ref\}\s+class=\{cn\(\s*['"]grid place-content-center peer h-4 w-4)/g,
            '$1data-state={checked ? "checked" : "unchecked"}\n  $2'
          );
          // Wrap the indicator span with {#if checked} - the span contains grid place-content-center text-current
          // Match: ><span class={cn("grid place-content-center text-current")}><Check .../></span></button>
          // Replace with: >{#if checked}<span ...><Check .../></span>{/if}</button>
          result = result.replace(
            />(<span class=\{cn\(["']grid place-content-center text-current["']\)\}>)(<Check[^/]*\/>)(<\/span>)(<\/button)/g,
            '>{#if checked}$1$2$3{/if}$4'
          );
        }
      }

      return result;
    },
  };
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default createRadixCleanupPlugin;
