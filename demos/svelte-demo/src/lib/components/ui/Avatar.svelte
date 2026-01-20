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
  class={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
  {...restProps}
>
  {@render children?.()}
</span>
