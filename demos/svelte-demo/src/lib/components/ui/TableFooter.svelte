<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let ref;
</script>

<tfoot
  bind:this={ref}
  {...$$restProps}
  class={cn(
    'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
    className
  )}
/>
