<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLTdAttributes } from "svelte/elements";

  interface Props extends HTMLTdAttributes {
    class?: string;
    ref?: HTMLTableCellElement | null;
  }

  let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<td bind:this={ref} class={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...restProps}>
  {@render children?.()}
</td>
