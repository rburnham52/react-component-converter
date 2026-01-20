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
  <span
    ref="elementRef"
    :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', props.class)"
    v-bind="$attrs"
  >
    <slot />
  </span>
</template>
