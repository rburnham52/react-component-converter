<script setup lang="ts">
import { cn } from '@/lib/utils';
// import { X } from 'lucide-vue-next'; // Not used in fallback template

interface Props {
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <div
    :class="cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', props.class)"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
