<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Circle } from 'lucide-vue-next';

interface Props {
  class?: string;
}

const props = defineProps<Props>();

const elementRef = ref<HTMLElement | null>(null);

defineExpose({ elementRef });
</script>

<template>
  <div
    ref="elementRef"
    :class="
      cn(
        'flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        props.class
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
