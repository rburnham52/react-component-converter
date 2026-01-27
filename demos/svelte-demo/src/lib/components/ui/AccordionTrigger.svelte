<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { ChevronDown } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  let ref;
</script>

<h3 class="flex">
  <button
    bind:this={ref}
    class={cn(
      'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
      className
    )}
    {...$$restProps}
    >{@render children?.()}<ChevronDown
      class="h-4 w-4 shrink-0 transition-transform duration-200"
    /></button
  >
</h3>
