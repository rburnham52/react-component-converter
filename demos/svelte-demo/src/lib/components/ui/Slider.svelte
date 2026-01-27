<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  export let disabled: boolean = false;
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let ref;
</script>

<div
  bind:this={ref}
  class={cn(
    'relative flex w-full touch-none select-none items-center',
    className
  )}
  {...$$restProps}
>
  <div
    class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
  >
    <div class="absolute h-full bg-primary"><slot /></div>
  </div>
  <span
    class="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    ><slot /></span
  >
</div>
