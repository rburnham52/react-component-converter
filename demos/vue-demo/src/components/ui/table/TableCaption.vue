<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
const elementRef = ref<HTMLTableCaptionElement | null>(null);
defineExpose({ elementRef });
</script>

<template>
  <caption ref="elementRef" :class="cn('mt-4 text-sm text-muted-foreground', props.class)" v-bind="$attrs">
    <slot />
  </caption>
</template>
