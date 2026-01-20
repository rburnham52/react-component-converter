<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLTableAttributes } from "svelte/elements";

  interface Props extends HTMLTableAttributes {
    class?: string;
    ref?: HTMLTableElement | null;
  }

  let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<div class="relative w-full overflow-auto">
  <table bind:this={ref} class={cn("w-full caption-bottom text-sm", className)} {...restProps}>
    {@render children?.()}
  </table>
</div>
