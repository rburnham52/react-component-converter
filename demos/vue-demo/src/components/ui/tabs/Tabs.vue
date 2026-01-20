<script setup lang="ts">
import { ref, provide, readonly } from 'vue';

interface Props {
  class?: string;
  defaultValue?: string;
  modelValue?: string;
}

const props = defineProps<Props>();
const elementRef = ref<HTMLDivElement | null>(null);

const activeTab = ref(props.modelValue || props.defaultValue || "");

provide('tabs', {
  activeTab: readonly(activeTab),
  setActiveTab: (val: string) => { activeTab.value = val; }
});

defineExpose({ elementRef });
</script>

<template>
  <div ref="elementRef" :class="props.class" :data-value="activeTab" v-bind="$attrs">
    <slot />
  </div>
</template>
