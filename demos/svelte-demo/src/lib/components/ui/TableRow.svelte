<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let ref;
</script>

<tr
  bind:this={ref}
  {...$$restProps}
  class={cn(
    'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
    className
  )}><slot /></tr
>
