<script lang="ts">
  import { cn } from '$lib/utils';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    class?: string;
    ref?: HTMLSpanElement | null;
  }

  let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<span
  bind:this={ref}
  class={cn('relative flex w-full touch-none select-none items-center', className)}
  {...restProps}
>
  {@render children?.()}
</span>
