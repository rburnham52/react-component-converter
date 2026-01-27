<template>
  <h2
    ref="ref"
    :class="cn('text-lg font-semibold leading-none tracking-tight', className)"
    v-bind="$attrs"
  >
    <slot></slot>
  </h2>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { X } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    class={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
);
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    class={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
</script>
