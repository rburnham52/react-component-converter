<script lang="ts">
import { cn } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";

interface Props extends HTMLAttributes<HTMLDivElement> {
  class?: string;
  ref?: HTMLDivElement | null;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

let { class: className, ref = $bindable(null), orientation = "horizontal", decorative = true, children, ...restProps }: Props = $props();
</script>

<div
  bind:this={ref}
  role={decorative ? "none" : "separator"}
  aria-orientation={decorative ? undefined : orientation}
  class={cn(
    "shrink-0 bg-border",
    orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
    className
  )}
  {...restProps}
></div>