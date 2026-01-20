<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLImgAttributes } from "svelte/elements";

  interface Props extends HTMLImgAttributes {
    class?: string;
    ref?: HTMLImageElement | null;
  }

  let { class: className, ref = $bindable(null), ...restProps }: Props = $props();
</script>

<img bind:this={ref} class={cn("aspect-square h-full w-full", className)} {...restProps} />
