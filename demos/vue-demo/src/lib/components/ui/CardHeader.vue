<template>
  <div
    ref="ref"
    :class="cn('flex flex-col space-y-1.5 p-6', className)"
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
