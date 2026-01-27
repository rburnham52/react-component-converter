<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import type { HTMLLabelAttributes } from 'svelte/elements';
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils';
  const labelVariants = cva(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
  );

  let ref;
</script>

<label bind:this={ref} class={cn(labelVariants(), className)} {...$$restProps}
  ><slot /></label
>
