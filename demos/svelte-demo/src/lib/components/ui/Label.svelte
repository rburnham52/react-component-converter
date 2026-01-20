<script lang="ts">
import { cn } from "$lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "svelte/elements";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
    },
    defaultVariants: {
    },
  }
);

interface Props extends HTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {
  class?: string;
  ref?: HTMLLabelElement | null;
}

let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<div bind:this={ref} class={cn(labelVariants({  }), className)} {...restProps}>
  {@render children?.()}
</div>