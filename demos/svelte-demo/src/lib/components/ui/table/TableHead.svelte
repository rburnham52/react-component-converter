<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLThAttributes } from "svelte/elements";

  interface Props extends HTMLThAttributes {
    class?: string;
    ref?: HTMLTableCellElement | null;
  }

  let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<th bind:this={ref} class={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className)} {...restProps}>
  {@render children?.()}
</th>
