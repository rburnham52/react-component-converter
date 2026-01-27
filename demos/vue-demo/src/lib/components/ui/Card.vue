<template>
  <div
    ref="ref"
    :class="
      cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)
    "
    v-bind="$attrs"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { cn } from '@/lib/utils';
</script>
