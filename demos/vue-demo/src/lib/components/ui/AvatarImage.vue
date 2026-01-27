<template>
  <img
    ref="ref"
    :class="cn('aspect-square h-full w-full', className)"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { cn } from '@/lib/utils';
</script>
