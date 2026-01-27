<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  let ref;
</script>

<div class="relative w-full overflow-auto">
  <table
    bind:this={ref}
    {...$$restProps}
    class={cn('w-full caption-bottom text-sm', mergedClass || className)}
  >
    <slot />
  </table>
</div>
