<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';
// import { X } from 'lucide-vue-next'; // Not used in fallback template

interface Props {
  class?: string;
}

const props = defineProps<Props>();

const elementRef = ref<HTMLParagraphElement | null>(null);

defineExpose({ elementRef });
</script>

<template>
  <p ref="elementRef" :class="cn('text-sm text-muted-foreground', props.class)" v-bind="$attrs">
    <slot />
  </p>
</template>
