<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
const elementRef = ref<HTMLTableSectionElement | null>(null);
defineExpose({ elementRef });
</script>

<template>
  <thead ref="elementRef" :class="cn('[&_tr]:border-b', props.class)" v-bind="$attrs">
    <slot />
  </thead>
</template>
