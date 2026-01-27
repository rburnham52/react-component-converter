<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  export let decorative: boolean = false;
  export let orientation: string = 'horizontal';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let ref;
</script>

<div
  bind:this={ref}
  {decorative}
  {orientation}
  class={cn(
    'shrink-0 bg-border',
    orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
    className
  )}
  {...$$restProps}
>
  <slot />
</div>
