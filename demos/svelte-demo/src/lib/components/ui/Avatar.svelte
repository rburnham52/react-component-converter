<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let ref;
</script>

<span
  bind:this={ref}
  class={cn(
    'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
    className
  )}
  {...$$restProps}><slot /></span
>
