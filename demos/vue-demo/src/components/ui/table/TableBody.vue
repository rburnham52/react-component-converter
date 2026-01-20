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
  <tbody ref="elementRef" :class="cn('[&_tr:last-child]:border-0', props.class)" v-bind="$attrs">
    <slot />
  </tbody>
</template>
