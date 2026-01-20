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
  <div ref="elementRef" :class="cn('flex items-center p-6 pt-0', props.class)" v-bind="$attrs">
    <slot />
  </div>
</template>
