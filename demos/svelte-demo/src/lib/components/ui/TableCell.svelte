<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let ref;
</script>

<td
  bind:this={ref}
  {...$$restProps}
  class={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
  ><slot /></td
>
