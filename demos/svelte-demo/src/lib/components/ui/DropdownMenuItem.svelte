<script lang="ts">
  export let size: string = 'default';
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  export let disabled: boolean = false;
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
  class={cn(
    'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    inset && 'pl-8',
    className
  )}
  {...$$restProps}
>
  <slot />
</div>
