<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
const elementRef = ref<HTMLTableElement | null>(null);
defineExpose({ elementRef });
</script>

<template>
  <div class="relative w-full overflow-auto">
    <table ref="elementRef" :class="cn('w-full caption-bottom text-sm', props.class)" v-bind="$attrs">
      <slot />
    </table>
  </div>
</template>
