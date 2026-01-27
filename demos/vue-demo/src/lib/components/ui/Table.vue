<template>
  <div class="relative w-full overflow-auto">
    <table
      ref="ref"
      :class="cn('w-full caption-bottom text-sm', className)"
      v-bind="$attrs"
    >
      <slot></slot>
    </table>
  </div>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { cn } from '@/lib/utils';
</script>
