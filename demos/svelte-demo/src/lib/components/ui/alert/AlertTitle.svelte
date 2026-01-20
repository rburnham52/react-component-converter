<script lang="ts">
import { cn } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";

interface Props extends HTMLAttributes<HTMLParagraphElement> {
  class?: string;
  ref?: HTMLParagraphElement | null;
}

let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<p bind:this={ref} class={cn("mb-1 font-medium leading-none tracking-tight", className)} {...restProps}>
  {@render children?.()}
</p>