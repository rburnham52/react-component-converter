<script lang="ts">
  import { cn } from '$lib/utils';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    ref?: HTMLDivElement | null;
  }

  let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<div bind:this={ref} class={cn('shrink-0 bg-border', className)} {...restProps}>
  {@render children?.()}
</div>
