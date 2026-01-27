<template>
  <div
    ref="ref"
    :class="
      cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
        className
      )
    "
    v-bind="$attrs"
  >
    <div
      class="h-full w-full flex-1 bg-primary transition-all"
      :style="{ transform: `translateX(-${100 - (value || 0)}%)` }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const { className, value } = defineProps({
  className: { type: String, default: undefined },
  value: { type: String, default: undefined },
});
import { cn } from '@/lib/utils';
</script>
