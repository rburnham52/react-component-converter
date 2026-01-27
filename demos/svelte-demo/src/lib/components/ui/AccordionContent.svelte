<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { ChevronDown } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  let ref;
</script>

<div
  class="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
  bind:this={ref}
  {...$$restProps}
>
  <div class={cn('pb-4 pt-0', mergedClass || className)}>
    {@render children?.()}
  </div>
</div>
