<template>
  <h3 
    ><component
      ref="ref"
      :class="
        cn(
          'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
          className
        )
      "
      :is="AccordionPrimitive.Trigger"
      v-bind="$attrs"
      ><slot /><ChevronDown></ChevronDown></h3></component>
</template>

<script setup lang="ts">
const { className } = defineProps({
  className: { type: String, default: undefined }
});
import { ChevronDown } from 'lucide-vue-next';
import { cn } from "@/lib/utils";
</script>