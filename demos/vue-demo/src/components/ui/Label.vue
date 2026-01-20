<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {},
    defaultVariants: {},
  }
);

interface Props {
  class?: string;
}

const props = defineProps<Props>();

const elementRef = ref<HTMLLabelElement | null>(null);

defineExpose({ elementRef });
</script>

<template>
  <div ref="elementRef" :class="cn(labelVariants({}), props.class)" v-bind="$attrs">
    <slot />
  </div>
</template>
