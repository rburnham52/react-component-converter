<script lang="ts">
  import { cn } from '$lib/utils';
  import type { HTMLAttributes } from 'svelte/elements';
  import { ChevronDown } from 'lucide-svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    ref?: HTMLDivElement | null;
  }

  let { class: className, ref = $bindable(null), children, ...restProps }: Props = $props();
</script>

<div bind:this={ref} class={cn('border-b', className)} {...restProps}>
  {@render children?.()}
</div>
