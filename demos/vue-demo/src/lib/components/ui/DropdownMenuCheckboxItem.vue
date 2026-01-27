<template>
  <div
    ref="ref"
    :class="
      cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )
    "
    :checked="checked"
    v-bind="$attrs"
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
      ><span><Check></Check></span></span
    ><slot />
  </div>
</template>

<script setup lang="ts">
const { className, disabled, checked } = defineProps({
  className: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  checked: { type: Boolean, default: false },
});
import { Check, ChevronRight, Circle } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      class={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  );
};
</script>
