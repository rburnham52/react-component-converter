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

<div>
  <div
    bind:this={ref}
    {sideOffset}
    class={cn(
      'z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]',
      className
    )}
    {...$$restProps}
  >
    <slot />
  </div>
</div>
