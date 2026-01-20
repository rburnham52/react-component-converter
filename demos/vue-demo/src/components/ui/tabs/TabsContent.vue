<script setup lang="ts">
import { ref, inject, computed } from 'vue';
import type { Ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
  value: string;
}

const props = defineProps<Props>();

const elementRef = ref<HTMLDivElement | null>(null);

const tabs = inject<{ activeTab: Ref<string>; setActiveTab: (val: string) => void }>('tabs')!;

const isActive = computed(() => tabs.activeTab.value === props.value);

defineExpose({ elementRef });
</script>

<template>
  <div
    v-if="isActive"
    ref="elementRef"
    role="tabpanel"
    :data-state="isActive ? 'active' : 'inactive'"
    :class="
      cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        props.class
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
