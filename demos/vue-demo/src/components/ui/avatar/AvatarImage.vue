<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
  src?: string;
  alt?: string;
}

const props = defineProps<Props>();
const elementRef = ref<HTMLImageElement | null>(null);
defineExpose({ elementRef });
</script>

<template>
  <img ref="elementRef" :class="cn('aspect-square h-full w-full', props.class)" :src="props.src" :alt="props.alt" v-bind="$attrs" />
</template>
