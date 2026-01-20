<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-vue-next';

interface Props {
  class?: string;
}

const props = defineProps<Props>();

const elementRef = ref<HTMLButtonElement | null>(null);

defineExpose({ elementRef });
</script>

<template>
  <button
    ref="elementRef"
    :class="
      cn(
        'grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        props.class
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
