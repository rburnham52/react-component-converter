<script lang="ts">
  import { getContext } from "svelte";
  import { cn } from "$lib/utils";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends HTMLButtonAttributes {
    class?: string;
    ref?: HTMLButtonElement | null;
    value: string;
  }

  let { class: className, ref = $bindable(null), value, children, ...restProps }: Props = $props();

  const tabs = getContext<{ activeTab: string; setActiveTab: (val: string) => void }>("tabs");

  const isActive = $derived(tabs.activeTab === value);
</script>

<button
  bind:this={ref}
  type="button"
  role="tab"
  aria-selected={isActive}
  data-state={isActive ? "active" : "inactive"}
  class={cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
    className
  )}
  onclick={() => tabs.setActiveTab(value)}
  {...restProps}
>
  {@render children?.()}
</button>
