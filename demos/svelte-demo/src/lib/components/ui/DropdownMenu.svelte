<script lang="ts">
import { cn } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";
import { Check, ChevronRight, Circle } from "lucide-svelte";

interface Props extends HTMLAttributes<HTMLElement> {
  class?: string;
  ref?: HTMLElement | null;
}

let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<div bind:this={ref} class={cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", className)} {...restProps}>
  {@render children?.()}
</div>