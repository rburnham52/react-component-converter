<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let ref;
</script>

<thead
  bind:this={ref}
  {...$$restProps}
  class={cn('[&_tr]:border-b', mergedClass || className)}><slot /></thead
>
