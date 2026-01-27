<template>
  <button
    ref="ref"
    :data-state="checked ? 'checked' : 'unchecked'"
    :class="
      cn(
        'grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className
      )
    "
    v-bind="$attrs"
  >
    <span v-if="checked" :class="cn('grid place-content-center text-current')"
      ><Check></Check
    ></span>
  </button>
</template>

<script setup lang="ts">
const { className, checked } = defineProps({
  className: { type: String, default: undefined },
  checked: { type: Boolean, default: false },
});
import { Check } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
</script>
