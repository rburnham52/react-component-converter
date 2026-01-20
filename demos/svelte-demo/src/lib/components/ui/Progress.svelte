<script lang="ts">
  import { cn } from '$lib/utils';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    ref?: HTMLDivElement | null;
  }

  let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<div
  bind:this={ref}
  class={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
  {...restProps}
>
  {@render children?.()}
</div>
