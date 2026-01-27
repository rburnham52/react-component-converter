<template>
  <div
    role="alert"
    ref="ref"
    :class="
      cn(
        alertVariants({
          variant,
        }),
        className
      )
    "
    v-bind="$attrs"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const { variant, className } = defineProps({
  variant: { type: String, default: 'default' },
  className: { type: String, default: undefined },
});
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
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
</script>
