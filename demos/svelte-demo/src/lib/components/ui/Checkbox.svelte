<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  export let disabled: boolean = false;
  export let checked: boolean = false;
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { Check } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  let ref;
</script>

<button
  data-state={checked ? 'checked' : 'unchecked'}
  bind:this={ref}
  class={cn(
    'grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
    className
  )}
  {...$$restProps}
  >{#if checked}<span class={cn('grid place-content-center text-current')}
      ><Check class="h-4 w-4" /></span
    >{/if}</button
>
