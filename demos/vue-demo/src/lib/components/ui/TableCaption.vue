<template>
  <caption
    ref="ref"
    :class="cn('mt-4 text-sm text-muted-foreground', className)"
    v-bind="$attrs"
  >
    <slot></slot>
  </caption>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { cn } from '@/lib/utils';
</script>
