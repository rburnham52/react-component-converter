<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let ref;
</script>

<caption
  bind:this={ref}
  {...$$restProps}
  class={cn('mt-4 text-sm text-muted-foreground', mergedClass || className)}
  ><slot /></caption
>
