<script lang="ts">
  import { getContext } from "svelte";
  import { cn } from "$lib/utils";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    ref?: HTMLDivElement | null;
    value: string;
  }

  let { class: className, ref = $bindable(null), value, children, ...restProps }: Props = $props();

  const tabs = getContext<{ activeTab: string; setActiveTab: (val: string) => void }>("tabs");

  const isActive = $derived(tabs.activeTab === value);
</script>

{#if isActive}
  <div
    bind:this={ref}
    role="tabpanel"
    data-state={isActive ? "active" : "inactive"}
    class={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...restProps}
  >
    {@render children?.()}
  </div>
{/if}
