<script setup lang="ts">
import { ref, computed } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  class?: string;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  orientation: "horizontal",
  decorative: true
});

const elementRef = ref<HTMLDivElement | null>(null);

defineExpose({ elementRef });

const computedClass = computed(() => cn(
  "shrink-0 bg-border",
  props.orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
  props.class
));
</script>

<template>
  <div
    ref="elementRef"
    :role="props.decorative ? 'none' : 'separator'"
    :aria-orientation="props.decorative ? undefined : props.orientation"
    :class="computedClass"
    v-bind="$attrs"
  ></div>
</template>
