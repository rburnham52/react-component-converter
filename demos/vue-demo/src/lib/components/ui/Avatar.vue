<template>
  <span
    ref="ref"
    :class="
      cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )
    "
    v-bind="$attrs"
    ><slot></slot
  ></span>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { cn } from '@/lib/utils';
</script>
