<template>
  <thead ref="ref" :class="cn('[&_tr]:border-b', className)" v-bind="$attrs">
    <slot></slot>
  </thead>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { cn } from '@/lib/utils';
</script>
