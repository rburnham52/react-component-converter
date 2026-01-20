<script lang="ts">
import { cn } from "$lib/utils";
import { X } from "lucide-svelte";

interface Props {
  class?: string;
}

let { class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...restProps}>
  {@render children?.()}
</div>