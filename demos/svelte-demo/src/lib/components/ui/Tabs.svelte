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
  class={cn(
    'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</div>
