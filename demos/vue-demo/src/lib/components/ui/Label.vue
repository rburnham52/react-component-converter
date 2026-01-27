<template>
  <label ref="ref" :class="cn(labelVariants(), className)" v-bind="$attrs"
    ><slot></slot
  ></label>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);
</script>
