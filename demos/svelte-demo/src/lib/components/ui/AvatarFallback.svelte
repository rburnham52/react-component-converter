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
    'flex h-full w-full items-center justify-center rounded-full bg-muted',
    className
  )}
  {...$$restProps}><slot /></span
>
