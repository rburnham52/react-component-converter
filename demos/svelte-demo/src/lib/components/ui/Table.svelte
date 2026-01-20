<script lang="ts">
  import { cn } from '$lib/utils';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLTableElement> {
    class?: string;
    ref?: HTMLTableElement | null;
  }

  let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<div bind:this={ref} class={cn('w-full caption-bottom text-sm', className)} {...restProps}>
  {@render children?.()}
</div>
