<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let ref;
</script>

<tbody
  bind:this={ref}
  {...$$restProps}
  class={cn('[&_tr:last-child]:border-0', mergedClass || className)}
  ><slot /></tbody
>
