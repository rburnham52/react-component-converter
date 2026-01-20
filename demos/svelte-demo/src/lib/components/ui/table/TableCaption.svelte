<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLTableCaptionElement> {
    class?: string;
    ref?: HTMLTableCaptionElement | null;
  }

  let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<caption bind:this={ref} class={cn("mt-4 text-sm text-muted-foreground", className)} {...restProps}>
  {@render children?.()}
</caption>
