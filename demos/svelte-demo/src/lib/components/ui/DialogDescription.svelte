<script lang="ts">
import { cn } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";
import { X } from "lucide-svelte";

interface Props extends HTMLAttributes<HTMLParagraphElement> {
  class?: string;
  ref?: HTMLParagraphElement | null;
}

let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<p bind:this={ref} class={cn("text-sm text-muted-foreground", className)} {...restProps}>
  {@render children?.()}
</p>