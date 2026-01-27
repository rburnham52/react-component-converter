<script lang="ts">
  export let className: string | undefined = undefined;
  $: mergedClass = $$props.class;
  import { cn } from '$lib/utils';
</script>

<div
  {...$$restProps}
  class={cn('animate-pulse rounded-md bg-muted', mergedClass || className)}
>
  <slot />
</div>
