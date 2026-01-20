<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
const elementRef = ref<HTMLSpanElement | null>(null);
defineExpose({ elementRef });
</script>

<template>
  <span ref="elementRef" :class="cn('flex h-full w-full items-center justify-center rounded-full bg-muted', props.class)" v-bind="$attrs">
    <slot />
  </span>
</template>
