<template>
  <div
    ref="ref"
    :class="cn('text-2xl font-semibold leading-none tracking-tight', className)"
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
