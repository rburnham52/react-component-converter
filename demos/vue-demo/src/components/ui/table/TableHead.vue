<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
const elementRef = ref<HTMLTableCellElement | null>(null);
defineExpose({ elementRef });
</script>

<template>
  <th ref="elementRef" :class="cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', props.class)" v-bind="$attrs">
    <slot />
  </th>
</template>
