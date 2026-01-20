<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
const elementRef = ref<HTMLTableRowElement | null>(null);
defineExpose({ elementRef });
</script>

<template>
  <tr ref="elementRef" :class="cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', props.class)" v-bind="$attrs">
    <slot />
  </tr>
</template>
