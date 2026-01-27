<template>
  <div
    ref="ref"
    :class="
      cn(
        'flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        inset && 'pl-8',
        className
      )
    "
    v-bind="$attrs"
  >
    <slot /><ChevronRight></ChevronRight>
  </div>
</template>

<script setup lang="ts">
const { size, className } = defineProps({
  size: { type: String, default: 'default' },
  className: { type: String, default: undefined },
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
