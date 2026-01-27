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
  class={cn('flex flex-col space-y-1.5 p-6', mergedClass || className)}
>
  <slot />
</div>
