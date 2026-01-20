<script lang="ts">
import { cn } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";
import { X } from "lucide-svelte";

interface Props extends HTMLAttributes<HTMLHeadingElement> {
  class?: string;
  ref?: HTMLHeadingElement | null;
}

let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<h5 bind:this={ref} class={cn("text-lg font-semibold leading-none tracking-tight", className)} {...restProps}>
  {@render children?.()}
</h5>