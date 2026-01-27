<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  export let value: string | undefined = undefined;
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  function stringifyStyles(stylesObj) {
    let styles = '';
    for (let key in stylesObj) {
      const dashedKey = key.replace(/[A-Z]/g, function (match) {
        return '-' + match.toLowerCase();
      });
      styles += dashedKey + ':' + stylesObj[key] + ';';
    }
    return styles;
  }

  let ref;
</script>

<div
  bind:this={ref}
  class={cn(
    'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
    className
  )}
  {...$$restProps}
>
  <div
    style={stringifyStyles({
      transform: `translateX(-${100 - (value || 0)}%)`,
    })}
    class="h-full w-full flex-1 bg-primary transition-all"
  >
    <slot />
  </div>
</div>
