<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLTableRowElement> {
    class?: string;
    ref?: HTMLTableRowElement | null;
  }

  let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<tr bind:this={ref} class={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...restProps}>
  {@render children?.()}
</tr>
