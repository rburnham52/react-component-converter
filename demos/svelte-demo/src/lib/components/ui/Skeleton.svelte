<script lang="ts">
import { cn } from "$lib/utils";

interface Props {
  class?: string;
}

let { class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn("animate-pulse rounded-md bg-muted", className)} {...restProps}>
  {@render children?.()}
</div>