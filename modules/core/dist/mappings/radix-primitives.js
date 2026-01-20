/**
 * Mapping of Radix UI primitives to Bits UI (Svelte) and Radix Vue equivalents.
 *
 * Svelte: Uses Bits UI (https://bits-ui.com) which provides Radix-like primitives
 * Vue: Uses Radix Vue (https://radix-vue.com) which is a direct port
 */
export const radixMappings = {
    '@radix-ui/react-accordion': {
        radixPackage: '@radix-ui/react-accordion',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Accordion.Root', vue: 'AccordionRoot' },
            Item: { svelte: 'Accordion.Item', vue: 'AccordionItem' },
            Trigger: { svelte: 'Accordion.Trigger', vue: 'AccordionTrigger' },
            Content: { svelte: 'Accordion.Content', vue: 'AccordionContent' },
            Header: { svelte: 'Accordion.Header', vue: 'AccordionHeader' },
        },
    },
    '@radix-ui/react-alert-dialog': {
        radixPackage: '@radix-ui/react-alert-dialog',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'AlertDialog.Root', vue: 'AlertDialogRoot' },
            Trigger: { svelte: 'AlertDialog.Trigger', vue: 'AlertDialogTrigger' },
            Portal: { svelte: 'AlertDialog.Portal', vue: 'AlertDialogPortal' },
            Overlay: { svelte: 'AlertDialog.Overlay', vue: 'AlertDialogOverlay' },
            Content: { svelte: 'AlertDialog.Content', vue: 'AlertDialogContent' },
            Title: { svelte: 'AlertDialog.Title', vue: 'AlertDialogTitle' },
            Description: { svelte: 'AlertDialog.Description', vue: 'AlertDialogDescription' },
            Cancel: { svelte: 'AlertDialog.Cancel', vue: 'AlertDialogCancel' },
            Action: { svelte: 'AlertDialog.Action', vue: 'AlertDialogAction' },
        },
    },
    '@radix-ui/react-avatar': {
        radixPackage: '@radix-ui/react-avatar',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Avatar.Root', vue: 'AvatarRoot' },
            Image: { svelte: 'Avatar.Image', vue: 'AvatarImage' },
            Fallback: { svelte: 'Avatar.Fallback', vue: 'AvatarFallback' },
        },
    },
    '@radix-ui/react-checkbox': {
        radixPackage: '@radix-ui/react-checkbox',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Checkbox.Root', vue: 'CheckboxRoot' },
            Indicator: { svelte: 'Checkbox.Indicator', vue: 'CheckboxIndicator' },
        },
    },
    '@radix-ui/react-collapsible': {
        radixPackage: '@radix-ui/react-collapsible',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Collapsible.Root', vue: 'CollapsibleRoot' },
            Trigger: { svelte: 'Collapsible.Trigger', vue: 'CollapsibleTrigger' },
            Content: { svelte: 'Collapsible.Content', vue: 'CollapsibleContent' },
        },
    },
    '@radix-ui/react-context-menu': {
        radixPackage: '@radix-ui/react-context-menu',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'ContextMenu.Root', vue: 'ContextMenuRoot' },
            Trigger: { svelte: 'ContextMenu.Trigger', vue: 'ContextMenuTrigger' },
            Portal: { svelte: 'ContextMenu.Portal', vue: 'ContextMenuPortal' },
            Content: { svelte: 'ContextMenu.Content', vue: 'ContextMenuContent' },
            Item: { svelte: 'ContextMenu.Item', vue: 'ContextMenuItem' },
            CheckboxItem: { svelte: 'ContextMenu.CheckboxItem', vue: 'ContextMenuCheckboxItem' },
            RadioGroup: { svelte: 'ContextMenu.RadioGroup', vue: 'ContextMenuRadioGroup' },
            RadioItem: { svelte: 'ContextMenu.RadioItem', vue: 'ContextMenuRadioItem' },
            Label: { svelte: 'ContextMenu.Label', vue: 'ContextMenuLabel' },
            Separator: { svelte: 'ContextMenu.Separator', vue: 'ContextMenuSeparator' },
            Sub: { svelte: 'ContextMenu.Sub', vue: 'ContextMenuSub' },
            SubTrigger: { svelte: 'ContextMenu.SubTrigger', vue: 'ContextMenuSubTrigger' },
            SubContent: { svelte: 'ContextMenu.SubContent', vue: 'ContextMenuSubContent' },
        },
    },
    '@radix-ui/react-dialog': {
        radixPackage: '@radix-ui/react-dialog',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Dialog.Root', vue: 'DialogRoot' },
            Trigger: { svelte: 'Dialog.Trigger', vue: 'DialogTrigger' },
            Portal: { svelte: 'Dialog.Portal', vue: 'DialogPortal' },
            Overlay: { svelte: 'Dialog.Overlay', vue: 'DialogOverlay' },
            Content: { svelte: 'Dialog.Content', vue: 'DialogContent' },
            Title: { svelte: 'Dialog.Title', vue: 'DialogTitle' },
            Description: { svelte: 'Dialog.Description', vue: 'DialogDescription' },
            Close: { svelte: 'Dialog.Close', vue: 'DialogClose' },
        },
    },
    '@radix-ui/react-dropdown-menu': {
        radixPackage: '@radix-ui/react-dropdown-menu',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'DropdownMenu.Root', vue: 'DropdownMenuRoot' },
            Trigger: { svelte: 'DropdownMenu.Trigger', vue: 'DropdownMenuTrigger' },
            Portal: { svelte: 'DropdownMenu.Portal', vue: 'DropdownMenuPortal' },
            Content: { svelte: 'DropdownMenu.Content', vue: 'DropdownMenuContent' },
            Item: { svelte: 'DropdownMenu.Item', vue: 'DropdownMenuItem' },
            CheckboxItem: { svelte: 'DropdownMenu.CheckboxItem', vue: 'DropdownMenuCheckboxItem' },
            RadioGroup: { svelte: 'DropdownMenu.RadioGroup', vue: 'DropdownMenuRadioGroup' },
            RadioItem: { svelte: 'DropdownMenu.RadioItem', vue: 'DropdownMenuRadioItem' },
            Label: { svelte: 'DropdownMenu.Label', vue: 'DropdownMenuLabel' },
            Separator: { svelte: 'DropdownMenu.Separator', vue: 'DropdownMenuSeparator' },
            Sub: { svelte: 'DropdownMenu.Sub', vue: 'DropdownMenuSub' },
            SubTrigger: { svelte: 'DropdownMenu.SubTrigger', vue: 'DropdownMenuSubTrigger' },
            SubContent: { svelte: 'DropdownMenu.SubContent', vue: 'DropdownMenuSubContent' },
            Group: { svelte: 'DropdownMenu.Group', vue: 'DropdownMenuGroup' },
        },
    },
    '@radix-ui/react-hover-card': {
        radixPackage: '@radix-ui/react-hover-card',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'HoverCard.Root', vue: 'HoverCardRoot' },
            Trigger: { svelte: 'HoverCard.Trigger', vue: 'HoverCardTrigger' },
            Portal: { svelte: 'HoverCard.Portal', vue: 'HoverCardPortal' },
            Content: { svelte: 'HoverCard.Content', vue: 'HoverCardContent' },
        },
    },
    '@radix-ui/react-label': {
        radixPackage: '@radix-ui/react-label',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Label.Root', vue: 'Label', htmlFallback: 'label' },
        },
    },
    '@radix-ui/react-menubar': {
        radixPackage: '@radix-ui/react-menubar',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Menubar.Root', vue: 'MenubarRoot' },
            Menu: { svelte: 'Menubar.Menu', vue: 'MenubarMenu' },
            Trigger: { svelte: 'Menubar.Trigger', vue: 'MenubarTrigger' },
            Portal: { svelte: 'Menubar.Portal', vue: 'MenubarPortal' },
            Content: { svelte: 'Menubar.Content', vue: 'MenubarContent' },
            Item: { svelte: 'Menubar.Item', vue: 'MenubarItem' },
            Separator: { svelte: 'Menubar.Separator', vue: 'MenubarSeparator' },
            Sub: { svelte: 'Menubar.Sub', vue: 'MenubarSub' },
            SubTrigger: { svelte: 'Menubar.SubTrigger', vue: 'MenubarSubTrigger' },
            SubContent: { svelte: 'Menubar.SubContent', vue: 'MenubarSubContent' },
        },
    },
    '@radix-ui/react-navigation-menu': {
        radixPackage: '@radix-ui/react-navigation-menu',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'NavigationMenu.Root', vue: 'NavigationMenuRoot' },
            List: { svelte: 'NavigationMenu.List', vue: 'NavigationMenuList' },
            Item: { svelte: 'NavigationMenu.Item', vue: 'NavigationMenuItem' },
            Trigger: { svelte: 'NavigationMenu.Trigger', vue: 'NavigationMenuTrigger' },
            Content: { svelte: 'NavigationMenu.Content', vue: 'NavigationMenuContent' },
            Link: { svelte: 'NavigationMenu.Link', vue: 'NavigationMenuLink' },
            Indicator: { svelte: 'NavigationMenu.Indicator', vue: 'NavigationMenuIndicator' },
            Viewport: { svelte: 'NavigationMenu.Viewport', vue: 'NavigationMenuViewport' },
        },
    },
    '@radix-ui/react-popover': {
        radixPackage: '@radix-ui/react-popover',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Popover.Root', vue: 'PopoverRoot' },
            Trigger: { svelte: 'Popover.Trigger', vue: 'PopoverTrigger' },
            Anchor: { svelte: 'Popover.Anchor', vue: 'PopoverAnchor' },
            Portal: { svelte: 'Popover.Portal', vue: 'PopoverPortal' },
            Content: { svelte: 'Popover.Content', vue: 'PopoverContent' },
            Close: { svelte: 'Popover.Close', vue: 'PopoverClose' },
            Arrow: { svelte: 'Popover.Arrow', vue: 'PopoverArrow' },
        },
    },
    '@radix-ui/react-progress': {
        radixPackage: '@radix-ui/react-progress',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Progress.Root', vue: 'ProgressRoot' },
            Indicator: { svelte: 'Progress.Indicator', vue: 'ProgressIndicator' },
        },
    },
    '@radix-ui/react-radio-group': {
        radixPackage: '@radix-ui/react-radio-group',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'RadioGroup.Root', vue: 'RadioGroupRoot' },
            Item: { svelte: 'RadioGroup.Item', vue: 'RadioGroupItem' },
            Indicator: { svelte: 'RadioGroup.Indicator', vue: 'RadioGroupIndicator' },
        },
    },
    '@radix-ui/react-scroll-area': {
        radixPackage: '@radix-ui/react-scroll-area',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'ScrollArea.Root', vue: 'ScrollAreaRoot' },
            Viewport: { svelte: 'ScrollArea.Viewport', vue: 'ScrollAreaViewport' },
            Scrollbar: { svelte: 'ScrollArea.Scrollbar', vue: 'ScrollAreaScrollbar' },
            Thumb: { svelte: 'ScrollArea.Thumb', vue: 'ScrollAreaThumb' },
            Corner: { svelte: 'ScrollArea.Corner', vue: 'ScrollAreaCorner' },
        },
    },
    '@radix-ui/react-select': {
        radixPackage: '@radix-ui/react-select',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Select.Root', vue: 'SelectRoot' },
            Trigger: { svelte: 'Select.Trigger', vue: 'SelectTrigger' },
            Value: { svelte: 'Select.Value', vue: 'SelectValue' },
            Portal: { svelte: 'Select.Portal', vue: 'SelectPortal' },
            Content: { svelte: 'Select.Content', vue: 'SelectContent' },
            Viewport: { svelte: 'Select.Viewport', vue: 'SelectViewport' },
            Item: { svelte: 'Select.Item', vue: 'SelectItem' },
            ItemText: { svelte: 'Select.ItemText', vue: 'SelectItemText' },
            ItemIndicator: { svelte: 'Select.ItemIndicator', vue: 'SelectItemIndicator' },
            ScrollUpButton: { svelte: 'Select.ScrollUpButton', vue: 'SelectScrollUpButton' },
            ScrollDownButton: { svelte: 'Select.ScrollDownButton', vue: 'SelectScrollDownButton' },
            Group: { svelte: 'Select.Group', vue: 'SelectGroup' },
            Label: { svelte: 'Select.Label', vue: 'SelectLabel' },
            Separator: { svelte: 'Select.Separator', vue: 'SelectSeparator' },
        },
    },
    '@radix-ui/react-separator': {
        radixPackage: '@radix-ui/react-separator',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Separator.Root', vue: 'Separator', htmlFallback: 'hr' },
        },
    },
    '@radix-ui/react-slider': {
        radixPackage: '@radix-ui/react-slider',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Slider.Root', vue: 'SliderRoot' },
            Track: { svelte: 'Slider.Track', vue: 'SliderTrack' },
            Range: { svelte: 'Slider.Range', vue: 'SliderRange' },
            Thumb: { svelte: 'Slider.Thumb', vue: 'SliderThumb' },
        },
    },
    '@radix-ui/react-switch': {
        radixPackage: '@radix-ui/react-switch',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Switch.Root', vue: 'SwitchRoot' },
            Thumb: { svelte: 'Switch.Thumb', vue: 'SwitchThumb' },
        },
    },
    '@radix-ui/react-tabs': {
        radixPackage: '@radix-ui/react-tabs',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Tabs.Root', vue: 'TabsRoot' },
            List: { svelte: 'Tabs.List', vue: 'TabsList' },
            Trigger: { svelte: 'Tabs.Trigger', vue: 'TabsTrigger' },
            Content: { svelte: 'Tabs.Content', vue: 'TabsContent' },
        },
    },
    '@radix-ui/react-toast': {
        radixPackage: '@radix-ui/react-toast',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Provider: { svelte: 'Toast.Provider', vue: 'ToastProvider' },
            Root: { svelte: 'Toast.Root', vue: 'ToastRoot' },
            Title: { svelte: 'Toast.Title', vue: 'ToastTitle' },
            Description: { svelte: 'Toast.Description', vue: 'ToastDescription' },
            Action: { svelte: 'Toast.Action', vue: 'ToastAction' },
            Close: { svelte: 'Toast.Close', vue: 'ToastClose' },
            Viewport: { svelte: 'Toast.Viewport', vue: 'ToastViewport' },
        },
    },
    '@radix-ui/react-toggle': {
        radixPackage: '@radix-ui/react-toggle',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'Toggle.Root', vue: 'Toggle' },
        },
    },
    '@radix-ui/react-toggle-group': {
        radixPackage: '@radix-ui/react-toggle-group',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Root: { svelte: 'ToggleGroup.Root', vue: 'ToggleGroupRoot' },
            Item: { svelte: 'ToggleGroup.Item', vue: 'ToggleGroupItem' },
        },
    },
    '@radix-ui/react-tooltip': {
        radixPackage: '@radix-ui/react-tooltip',
        sveltePackage: 'bits-ui',
        vuePackage: 'radix-vue',
        componentMap: {
            Provider: { svelte: 'Tooltip.Provider', vue: 'TooltipProvider' },
            Root: { svelte: 'Tooltip.Root', vue: 'TooltipRoot' },
            Trigger: { svelte: 'Tooltip.Trigger', vue: 'TooltipTrigger' },
            Portal: { svelte: 'Tooltip.Portal', vue: 'TooltipPortal' },
            Content: { svelte: 'Tooltip.Content', vue: 'TooltipContent' },
            Arrow: { svelte: 'Tooltip.Arrow', vue: 'TooltipArrow' },
        },
    },
};
/**
 * Get the mapping for a specific Radix package
 */
export function getRadixMapping(packageName) {
    return radixMappings[packageName];
}
/**
 * Get all Radix package names that have mappings
 */
export function getSupportedRadixPackages() {
    return Object.keys(radixMappings);
}
/**
 * Check if a package is a Radix package
 */
export function isRadixPackage(packageName) {
    return packageName.startsWith('@radix-ui/react-');
}
//# sourceMappingURL=radix-primitives.js.map