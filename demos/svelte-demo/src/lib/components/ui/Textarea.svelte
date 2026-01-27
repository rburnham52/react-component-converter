<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  export let disabled: boolean = false;
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let ref;
</script>

<textarea
  bind:this={ref}
  {...$$restProps}
  class={cn(
    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    className
  )}
></textarea>
