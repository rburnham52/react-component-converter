<script lang="ts">
import { cn } from "$lib/utils";
import { X } from "lucide-svelte";

interface Props {
  class?: string;
}

let { class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...restProps}>
  {@render children?.()}
</div>