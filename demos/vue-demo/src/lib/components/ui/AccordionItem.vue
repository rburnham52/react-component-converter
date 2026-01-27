<template>
  <div ref="ref" :class="cn('border-b', className)" v-bind="$attrs">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { ChevronDown } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
</script>
