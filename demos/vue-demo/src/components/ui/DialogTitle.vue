<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';
// import { X } from 'lucide-vue-next'; // Not used in fallback template

interface Props {
  class?: string;
}

const props = defineProps<Props>();

const elementRef = ref<HTMLHeadingElement | null>(null);

defineExpose({ elementRef });
</script>

<template>
  <h5
    ref="elementRef"
    :class="cn('text-lg font-semibold leading-none tracking-tight', props.class)"
    v-bind="$attrs"
  >
    <slot />
  </h5>
</template>
