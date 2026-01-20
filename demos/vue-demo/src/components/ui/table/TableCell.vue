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
  <td ref="elementRef" :class="cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', props.class)" v-bind="$attrs">
    <slot />
  </td>
</template>
