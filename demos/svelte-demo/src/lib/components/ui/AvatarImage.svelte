<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let ref;
</script>

<img
  bind:this={ref}
  class={cn('aspect-square h-full w-full', mergedClass || className)}
  {...$$restProps}
/>
