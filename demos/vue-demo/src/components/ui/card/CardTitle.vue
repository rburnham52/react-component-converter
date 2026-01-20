<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();

const elementRef = ref<HTMLDivElement | null>(null);

defineExpose({ elementRef });
</script>

<template>
  <div
    ref="elementRef"
    :class="cn('text-2xl font-semibold leading-none tracking-tight', props.class)"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
