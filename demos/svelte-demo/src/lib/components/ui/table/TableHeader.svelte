<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLTableSectionElement> {
    class?: string;
    ref?: HTMLTableSectionElement | null;
  }

  let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<thead bind:this={ref} class={cn("[&_tr]:border-b", className)} {...restProps}>
  {@render children?.()}
</thead>
