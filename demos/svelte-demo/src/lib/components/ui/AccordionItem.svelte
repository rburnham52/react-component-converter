<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { ChevronDown } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  let ref;
</script>

<div
  bind:this={ref}
  class={cn('border-b', mergedClass || className)}
  {...$$restProps}
>
  <slot />
</div>
