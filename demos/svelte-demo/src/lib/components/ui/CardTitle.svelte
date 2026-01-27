<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let ref;
</script>

<div
  bind:this={ref}
  {...$$restProps}
  class={cn(
    'text-2xl font-semibold leading-none tracking-tight',
    mergedClass || className
  )}
>
  <slot />
</div>
