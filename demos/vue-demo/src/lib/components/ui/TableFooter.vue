<template>
  <tfoot
    ref="ref"
    :class="
      cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)
    "
    v-bind="$attrs"
  ></tfoot>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { cn } from '@/lib/utils';
</script>
