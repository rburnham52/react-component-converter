<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  export let disabled: boolean = false;
  export let checked: boolean = false;
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
    'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    className
  )}
  {checked}
  {...$$restProps}
>
  <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
    ><span><Check class="h-4 w-4" /></span></span
  >{@render children?.()}
</div>
