<script lang="ts">
import { cn } from "$lib/utils";
import type { HTMLButtonAttributes } from "svelte/elements";
import { Check } from "lucide-svelte";

interface Props extends HTMLButtonAttributes {
  class?: string;
  ref?: HTMLButtonElement | null;
}

let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<button bind:this={ref} class={cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className)} {...restProps}>
  {@render children?.()}
</button>