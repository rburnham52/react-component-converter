<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { Check, ChevronRight, Circle } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  const DropdownMenuShortcut = ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLSpanElement>) => {
    return (
      <span
        class={cn(
          'ml-auto text-xs tracking-widest opacity-60',
          mergedClass || className
        )}
        {...props}
      >
        <slot />
      </span>
    );
  };

  let ref;
</script>

<div
  bind:this={ref}
  class={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
  {...$$restProps}
>
  <slot />
</div>
