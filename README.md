# Component Converter

A CLI tool that converts React shadcn/ui components to **Svelte 5** and **Vue 3** using a two-stage pipeline with Mitosis as the intermediate representation.

## Features

- **React to Svelte 5**: Full support for Svelte 5 runes (`$props`, `$bindable`, `$derived`)
- **React to Vue 3**: Composition API with `<script setup>` syntax
- **CVA Support**: Preserves class-variance-authority patterns
- **forwardRef Handling**: Converts to framework-native ref patterns
- **Radix Primitives**: Extracts props from `@radix-ui/*` components
- **cn() Utility**: Maintains Tailwind class merging patterns
- **Multi-component Files**: Handles files with multiple exported components

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Convert a component to Vue
pnpm cc convert ./button.tsx -t vue -o ./Button.vue

# Convert a component to Svelte
pnpm cc convert ./button.tsx -t svelte -o ./Button.svelte

# Convert all components in a file
pnpm cc convert ./card.tsx -t vue -a
```

## Architecture

```
React TSX → [Parser] → Mitosis IR + ReactMeta → [Compiler] → Vue/Svelte
```

### Project Structure

```
component-converter/
├── modules/
│   ├── core/              # Shared types, mappings, utilities
│   ├── parser/            # React component parsing (ts-morph)
│   ├── compiler-vue/      # Vue 3 SFC generation
│   ├── compiler-svelte/   # Svelte 5 component generation
│   └── cli/               # Command-line interface
├── playground/            # React components for testing
└── demos/
    ├── vue-demo/          # Vue 3 demo app
    └── svelte-demo/       # Svelte 5 demo app
```

## CLI Commands

### `convert` - Direct Conversion

Convert React components directly to target framework:

```bash
# Single component output
pnpm cc convert ./Button.tsx -t vue -o ./Button.vue
pnpm cc convert ./Button.tsx -t svelte -o ./Button.svelte

# All components in file (outputs to directory)
pnpm cc convert ./Card.tsx -t vue -a -o ./components/

# Options
-t, --target <framework>   Target framework: vue | svelte
-o, --output <path>        Output file or directory
-a, --all                  Convert all components in file
-v, --verbose              Enable verbose output
--no-typescript            Output JavaScript instead of TypeScript
--svelte-version <version> Svelte version: 4 | 5 (default: 5)
```

### `parse` - Parse to IR

Parse React component and output intermediate representation:

```bash
pnpm cc parse ./Button.tsx
pnpm cc parse ./Button.tsx -o ./button.ir.json
```

### `compile` - Compile from IR

Compile Mitosis IR to target framework:

```bash
pnpm cc compile ./button.ir.json -t vue
pnpm cc compile ./button.ir.json -t svelte -o ./Button.svelte
```

## Supported Patterns

### Class Variance Authority (CVA)

```tsx
// Input: React
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

CVA definitions are preserved in both Vue and Svelte output with proper TypeScript types.

### React.forwardRef

```tsx
// Input: React
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants(), className)} {...props} />
  )
);
```

```vue
<!-- Output: Vue -->
<script setup lang="ts">
const elementRef = ref<HTMLButtonElement | null>(null);
defineExpose({ elementRef });
</script>
<template>
  <button ref="elementRef" :class="cn(buttonVariants(), props.class)" v-bind="$attrs">
    <slot />
  </button>
</template>
```

```svelte
<!-- Output: Svelte -->
<script lang="ts">
let { ref = $bindable(null), ...restProps }: Props = $props();
</script>
<button bind:this={ref} class={cn(buttonVariants(), className)} {...restProps}>
  {@render children?.()}
</button>
```

### Radix Primitives

Components using `@radix-ui/*` primitives automatically have their props extracted:

```tsx
// Input: React (Switch using @radix-ui/react-switch)
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root ref={ref} className={cn(...)} {...props}>
    <SwitchPrimitives.Thumb className={cn(...)} />
  </SwitchPrimitives.Root>
));
```

The converter automatically extracts props like `checked`, `onCheckedChange`, `disabled` from the Radix primitive definitions and generates proper state handling:

```svelte
<!-- Output: Svelte -->
<script lang="ts">
let { checked, onCheckedChange, disabled, ...restProps }: Props = $props();
const dataState = $derived(checked ? 'checked' : 'unchecked');

function toggle() {
  if (!disabled) {
    checked = !checked;
    onCheckedChange?.(checked);
  }
}
</script>
<button type="button" role="switch" aria-checked={checked} data-state={dataState} onclick={toggle}>
  <span data-state={dataState}>...</span>
</button>
```

### cn() Utility

The `cn()` utility for Tailwind class merging is preserved:

```tsx
// Input
cn("base-class", variant && "variant-class", className)

// Output (both frameworks)
cn("base-class", variant && "variant-class", className)
```

Both demos include the `cn` utility at `@/lib/utils` (Vue) or `$lib/utils` (Svelte).

## Data Flow

### 1. Parsing Phase

```
React TSX
    ↓
[ts-morph Analysis]
├── Find component definitions (forwardRef, arrow functions)
├── Extract CVA configurations
├── Analyze props from TypeScript interfaces
├── Detect Radix primitive usage
└── Categorize imports
    ↓
ParseResult {
  component: ExtendedMitosisComponent
  props: PropDefinition[]
  sharedMeta: { cvaConfigs, imports, usesCn }
}
```

### 2. Compilation Phase

```
ParseResult
    ↓
[Framework Compiler]
├── Generate script block
│   ├── Imports (vue/svelte utilities)
│   ├── CVA definitions
│   ├── Props interface
│   └── Ref handling
├── Generate template
│   ├── Element bindings
│   ├── Class merging
│   └── Event handlers
└── Format with Prettier
    ↓
Vue SFC or Svelte Component
```

## Core Types

### PropDefinition

```typescript
interface PropDefinition {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: unknown;
  isVariant: boolean;           // From CVA variants
  allowedValues?: string[];     // Variant options
  isStateProp?: boolean;        // Controls data-state attribute
  dataStateValues?: {           // For Radix state props
    true: string;
    false: string;
  };
}
```

### CvaConfig

```typescript
interface CvaConfig {
  name: string;                 // e.g., "buttonVariants"
  baseClasses: string;
  variants: Record<string, Record<string, string>>;
  defaultVariants: Record<string, string>;
  compoundVariants?: Array<{
    conditions: Record<string, string>;
    classes: string;
  }>;
}
```

### ReactComponentMeta

```typescript
interface ReactComponentMeta {
  cva?: CvaConfig;
  forwardRef?: {
    elementType: string;        // e.g., "HTMLButtonElement"
    paramName: string;          // e.g., "ref"
  };
  usesCn: boolean;
  originalImports: OriginalImport[];
}
```

## Module Details

### @component-converter/core

Shared types and utilities:

- **Types**: `PropDefinition`, `CvaConfig`, `ExtendedMitosisComponent`, etc.
- **Mappings**: Radix primitive props, icon mappings, framework equivalents
- **Utilities**: Class name helpers, type guards

### @component-converter/parser

React component analysis using ts-morph:

- **Analyzers**:
  - `cva.ts` - Extract CVA definitions
  - `forward-ref.ts` - Detect forwardRef patterns
  - `props.ts` - Extract props from interfaces/types
  - `imports.ts` - Categorize and transform imports

### @component-converter/compiler-vue

Vue 3 SFC generation:

- **Generators**:
  - `script.ts` - `<script setup>` block with Composition API
  - `template.ts` - Template with Vue directives

**Key transformations**:
- `React.forwardRef` → `ref()` + `defineExpose()`
- Props → `defineProps<Props>()` + `withDefaults()`
- `className` → `:class` binding
- Children → `<slot />`

### @component-converter/compiler-svelte

Svelte 5 component generation:

- **Generators**:
  - `script.ts` - Script block with runes
  - `template.ts` - Svelte template syntax

**Key transformations**:
- `React.forwardRef` → `$bindable()` + `bind:this`
- Props → `$props()` destructuring
- `className` → `class` attribute
- Children → `{@render children?.()}`
- State derivation → `$derived()`

### @component-converter/cli

Commander.js-based CLI with commands:
- `parse` - Output IR JSON
- `compile` - Compile IR to framework
- `convert` - Direct conversion (parse + compile)

## Demos

### Running the Vue Demo

```bash
cd demos/vue-demo
pnpm dev
```

### Running the Svelte Demo

```bash
cd demos/svelte-demo
pnpm dev
```

### Converting Components to Demos

```bash
# Convert all playground components to Vue
for file in playground/src/components/ui/*.tsx; do
  name=$(basename "$file" .tsx)
  Name=$(echo "$name" | sed -r 's/(^|-)([a-z])/\U\2/g')
  pnpm cc convert "$file" -t vue -o "demos/vue-demo/src/lib/components/ui/$Name.vue" -a
done

# Convert all playground components to Svelte
for file in playground/src/components/ui/*.tsx; do
  name=$(basename "$file" .tsx)
  Name=$(echo "$name" | sed -r 's/(^|-)([a-z])/\U\2/g')
  pnpm cc convert "$file" -t svelte -o "demos/svelte-demo/src/lib/components/ui/$Name.svelte" -a
done
```

## Extending the Converter

### Adding Radix Primitive Support

Edit `modules/core/src/mappings/radix-props.ts`:

```typescript
export const RADIX_PRIMITIVE_PROPS: RadixPrimitivePropsConfig = {
  '@radix-ui/react-new-component': {
    Root: [
      { name: 'open', type: 'boolean', optional: true, isStateProp: true,
        dataStateValues: { true: 'open', false: 'closed' } },
      { name: 'onOpenChange', type: '(open: boolean) => void', optional: true },
    ],
  },
};
```

### Adding Icon Mappings

Edit `modules/core/src/mappings/icons.ts`:

```typescript
export const iconMappings: Record<string, IconMapping> = {
  Check: {
    source: 'lucide-react',
    svelte: 'lucide-svelte',
    vue: 'lucide-vue-next',
  },
};
```

## Limitations

- **Complex Hooks**: Custom React hooks are not converted; they need manual rewriting
- **Context**: React Context is not automatically converted to Svelte context or Vue provide/inject
- **Compound Components**: Components with complex parent-child relationships may need manual adjustment
- **Radix Primitives**: Full Radix behavior requires using equivalent libraries (bits-ui for Svelte, radix-vue for Vue)

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## License

MIT
