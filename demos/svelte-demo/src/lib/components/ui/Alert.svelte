<script lang="ts">
import { cn } from "$lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "svelte/elements";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface Props extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  class?: string;
  ref?: HTMLDivElement | null;
}

let { class: className, variant = "default", ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<div bind:this={ref} class={cn(alertVariants({ variant }), className)} {...restProps}>
  {@render children?.()}
</div>