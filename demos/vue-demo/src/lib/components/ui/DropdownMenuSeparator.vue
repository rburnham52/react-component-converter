<template>
  <div
    ref="ref"
    :class="cn('-mx-1 my-1 h-px bg-muted', className)"
    v-bind="$attrs"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { Check, ChevronRight, Circle } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      class={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  );
};
</script>
