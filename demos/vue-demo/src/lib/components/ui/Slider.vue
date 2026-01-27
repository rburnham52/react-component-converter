<template>
  <div
    ref="ref"
    :class="
      cn('relative flex w-full touch-none select-none items-center', className)
    "
    v-bind="$attrs"
  >
    <div>
      <div><slot></slot></div>
    </div>
    <span><slot></slot></span>
  </div>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { cn } from '@/lib/utils';
</script>
