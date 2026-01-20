<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface Props {
  class?: string;
  variant?: 'default' | 'destructive';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
});

const elementRef = ref<HTMLDivElement | null>(null);

defineExpose({ elementRef });
</script>

<template>
  <div
    ref="elementRef"
    :class="cn(alertVariants({ variant: props.variant }), props.class)"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
