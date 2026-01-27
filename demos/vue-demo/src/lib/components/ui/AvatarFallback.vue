<template>
  <span
    ref="ref"
    :class="
      cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
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
