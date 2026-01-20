<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-vue-next';

interface Props {
  class?: string;
}

const props = defineProps<Props>();

const elementRef = ref<HTMLDivElement | null>(null);

defineExpose({ elementRef });
</script>

<template>
  <div ref="elementRef" :class="cn('border-b', props.class)" v-bind="$attrs">
    <slot />
  </div>
</template>
