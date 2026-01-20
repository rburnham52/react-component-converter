<script lang="ts">
  import { setContext } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    ref?: HTMLDivElement | null;
    defaultValue?: string;
    value?: string;
  }

  let { class: className, ref = $bindable(null), defaultValue, value, children, ...restProps }: Props = $props();

  let activeTab = $state(value || defaultValue || "");

  setContext("tabs", {
    get activeTab() { return activeTab; },
    setActiveTab: (val: string) => { activeTab = val; }
  });
</script>

<div bind:this={ref} class={className} data-value={activeTab} {...restProps}>
  {@render children?.()}
</div>
