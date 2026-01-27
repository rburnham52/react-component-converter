<template>
  <tbody
    ref="ref"
    :class="cn('[&_tr:last-child]:border-0', className)"
    v-bind="$attrs"
  >
    <slot></slot>
  </tbody>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { cn } from '@/lib/utils';
</script>
