<template>
  <div ref="ref" v-bind="$attrs">
    <div :class="cn('pb-4 pt-0', className)"><slot /></div>
  </div>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined },
});
import { ChevronDown } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
</script>
