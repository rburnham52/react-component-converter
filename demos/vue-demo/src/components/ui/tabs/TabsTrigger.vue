<script setup lang="ts">
import { ref, inject, computed } from 'vue';
import type { Ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
  value: string;
}

const props = defineProps<Props>();

const elementRef = ref<HTMLButtonElement | null>(null);

const tabs = inject<{ activeTab: Ref<string>; setActiveTab: (val: string) => void }>('tabs')!;

const isActive = computed(() => tabs.activeTab.value === props.value);

defineExpose({ elementRef });
</script>

<template>
  <button
    ref="elementRef"
    type="button"
    role="tab"
    :aria-selected="isActive"
    :data-state="isActive ? 'active' : 'inactive'"
    :class="
      cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        props.class
      )
    "
    @click="tabs.setActiveTab(props.value)"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
