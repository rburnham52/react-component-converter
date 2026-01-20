<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';
// import { X } from 'lucide-vue-next'; // Not used in fallback template

interface Props {
  class?: string;
}

const props = defineProps<Props>();

const elementRef = ref<HTMLDivElement | null>(null);

defineExpose({ elementRef });
</script>

<template>
  <div
    ref="elementRef"
    :class="
      cn(
        'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        props.class
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
