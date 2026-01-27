<template>
  <td
    ref="ref"
    :class="cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)"
    v-bind="$attrs"
  >
    <slot></slot>
  </td>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { cn } from '@/lib/utils';
</script>
