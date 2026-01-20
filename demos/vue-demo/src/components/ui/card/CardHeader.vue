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
  <div ref="elementRef" :class="cn('flex flex-col space-y-1.5 p-6', props.class)" v-bind="$attrs">
    <slot />
  </div>
</template>
