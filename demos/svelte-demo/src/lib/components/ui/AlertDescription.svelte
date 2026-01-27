<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLAttributes } from 'svelte/elements';
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils';
  const alertVariants = cva(
    'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
    {
      variants: {
        variant: {
          default: 'bg-background text-foreground',
          destructive:
            'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        },
      },
      defaultVariants: {
        variant: 'default',
      },
    }
  );

  let ref;
</script>

<div
  bind:this={ref}
  {...$$restProps}
  class={cn('text-sm [&_p]:leading-relaxed', mergedClass || className)}
>
  <slot />
</div>
