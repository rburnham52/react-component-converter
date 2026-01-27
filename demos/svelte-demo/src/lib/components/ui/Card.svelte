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
    'rounded-lg border bg-card text-card-foreground shadow-sm',
    className
  )}
>
  <slot />
</div>
