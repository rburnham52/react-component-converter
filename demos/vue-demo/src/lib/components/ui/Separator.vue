<template>
  <div
    ref="ref"
    :decorative="decorative"
    :orientation="orientation"
    :class="
      cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )
    "
    v-bind="$attrs"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const { className, decorative, orientation } = defineProps({
  className: { type: String, default: undefined },
  decorative: { type: Boolean, default: false },
  orientation: { type: String, default: 'horizontal' },
});
import { cn } from '@/lib/utils';
</script>
