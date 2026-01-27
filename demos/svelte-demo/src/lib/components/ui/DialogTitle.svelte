<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { X } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  const DialogHeader = ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      class={cn(
        'flex flex-col space-y-1.5 text-center sm:text-left',
        className
      )}
      {...props}
    >
      <slot />
    </div>
  );
  const DialogFooter = ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      class={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        className
      )}
      {...props}
    >
      <slot />
    </div>
  );

  let ref;
</script>

<h2
  bind:this={ref}
  class={cn(
    'text-lg font-semibold leading-none tracking-tight',
    mergedClass || className
  )}
  {...$$restProps}
>
  <slot />
</h2>
