<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
}

const props = defineProps<Props>();

const elementRef = ref<HTMLParagraphElement | null>(null);

defineExpose({ elementRef });
</script>

<template>
  <p
    ref="elementRef"
    :class="cn('mb-1 font-medium leading-none tracking-tight', props.class)"
    v-bind="$attrs"
  >
    <slot />
  </p>
</template>
