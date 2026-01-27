<template>
  <div
    ref="ref"
    :class="
      cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        inset && 'pl-8',
        className
      )
    "
    v-bind="$attrs"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const { size, className, disabled } = defineProps({
  size: { type: String, default: 'default' },
  className: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
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
