import { SourceFile, SyntaxKind, TypeReferenceNode } from 'ts-morph';
/**
 * Normalizes React-specific element types to standard HTML element types.
 *
 * Examples:
 * - "React.ElementRef<typeof LabelPrimitive.Root>" -> "HTMLLabelElement"
 * - "React.ElementRef<typeof DialogPrimitive.Content>" -> "HTMLDivElement"
 * - "HTMLButtonElement" -> "HTMLButtonElement" (unchanged)
 */
function normalizeElementType(rawType) {
    // If it's already a standard HTML element type, return as-is
    if (rawType.startsWith('HTML') && rawType.endsWith('Element')) {
        return rawType;
    }
    // Map Radix primitive names to HTML elements
    const radixToHtmlElement = {
        // Common primitives
        'Root': 'HTMLDivElement',
        'Trigger': 'HTMLButtonElement',
        'Content': 'HTMLDivElement',
        'Close': 'HTMLButtonElement',
        'Portal': 'HTMLDivElement',
        'Overlay': 'HTMLDivElement',
        'Title': 'HTMLHeadingElement',
        'Description': 'HTMLParagraphElement',
        // Label
        'LabelPrimitive.Root': 'HTMLLabelElement',
        // Dialog
        'DialogPrimitive.Root': 'HTMLDivElement',
        'DialogPrimitive.Trigger': 'HTMLButtonElement',
        'DialogPrimitive.Content': 'HTMLDivElement',
        'DialogPrimitive.Close': 'HTMLButtonElement',
        'DialogPrimitive.Title': 'HTMLHeadingElement',
        'DialogPrimitive.Description': 'HTMLParagraphElement',
        'DialogPrimitive.Overlay': 'HTMLDivElement',
        // Dropdown Menu
        'DropdownMenuPrimitive.Root': 'HTMLDivElement',
        'DropdownMenuPrimitive.Trigger': 'HTMLButtonElement',
        'DropdownMenuPrimitive.Content': 'HTMLDivElement',
        'DropdownMenuPrimitive.Item': 'HTMLDivElement',
        'DropdownMenuPrimitive.CheckboxItem': 'HTMLDivElement',
        'DropdownMenuPrimitive.RadioItem': 'HTMLDivElement',
        'DropdownMenuPrimitive.Label': 'HTMLDivElement',
        'DropdownMenuPrimitive.Separator': 'HTMLDivElement',
        'DropdownMenuPrimitive.SubTrigger': 'HTMLDivElement',
        'DropdownMenuPrimitive.SubContent': 'HTMLDivElement',
        // Accordion
        'AccordionPrimitive.Root': 'HTMLDivElement',
        'AccordionPrimitive.Item': 'HTMLDivElement',
        'AccordionPrimitive.Trigger': 'HTMLButtonElement',
        'AccordionPrimitive.Content': 'HTMLDivElement',
        // AlertDialog
        'AlertDialogPrimitive.Root': 'HTMLDivElement',
        'AlertDialogPrimitive.Trigger': 'HTMLButtonElement',
        'AlertDialogPrimitive.Content': 'HTMLDivElement',
        'AlertDialogPrimitive.Title': 'HTMLHeadingElement',
        'AlertDialogPrimitive.Description': 'HTMLParagraphElement',
        'AlertDialogPrimitive.Action': 'HTMLButtonElement',
        'AlertDialogPrimitive.Cancel': 'HTMLButtonElement',
        // Avatar
        'AvatarPrimitive.Root': 'HTMLSpanElement',
        'AvatarPrimitive.Image': 'HTMLImageElement',
        'AvatarPrimitive.Fallback': 'HTMLSpanElement',
        // Checkbox
        'CheckboxPrimitive.Root': 'HTMLButtonElement',
        'CheckboxPrimitive.Indicator': 'HTMLSpanElement',
        // Collapsible
        'CollapsiblePrimitive.Root': 'HTMLDivElement',
        'CollapsiblePrimitive.Trigger': 'HTMLButtonElement',
        'CollapsiblePrimitive.Content': 'HTMLDivElement',
        // Context Menu
        'ContextMenuPrimitive.Root': 'HTMLDivElement',
        'ContextMenuPrimitive.Trigger': 'HTMLSpanElement',
        'ContextMenuPrimitive.Content': 'HTMLDivElement',
        'ContextMenuPrimitive.Item': 'HTMLDivElement',
        // Hover Card
        'HoverCardPrimitive.Root': 'HTMLDivElement',
        'HoverCardPrimitive.Trigger': 'HTMLAnchorElement',
        'HoverCardPrimitive.Content': 'HTMLDivElement',
        // Menubar
        'MenubarPrimitive.Root': 'HTMLDivElement',
        'MenubarPrimitive.Menu': 'HTMLDivElement',
        'MenubarPrimitive.Trigger': 'HTMLButtonElement',
        'MenubarPrimitive.Content': 'HTMLDivElement',
        'MenubarPrimitive.Item': 'HTMLDivElement',
        // Navigation Menu
        'NavigationMenuPrimitive.Root': 'HTMLElement',
        'NavigationMenuPrimitive.List': 'HTMLUListElement',
        'NavigationMenuPrimitive.Item': 'HTMLLIElement',
        'NavigationMenuPrimitive.Trigger': 'HTMLButtonElement',
        'NavigationMenuPrimitive.Content': 'HTMLDivElement',
        'NavigationMenuPrimitive.Link': 'HTMLAnchorElement',
        // Popover
        'PopoverPrimitive.Root': 'HTMLDivElement',
        'PopoverPrimitive.Trigger': 'HTMLButtonElement',
        'PopoverPrimitive.Content': 'HTMLDivElement',
        'PopoverPrimitive.Close': 'HTMLButtonElement',
        // Progress
        'ProgressPrimitive.Root': 'HTMLDivElement',
        'ProgressPrimitive.Indicator': 'HTMLDivElement',
        // Radio Group
        'RadioGroupPrimitive.Root': 'HTMLDivElement',
        'RadioGroupPrimitive.Item': 'HTMLButtonElement',
        'RadioGroupPrimitive.Indicator': 'HTMLSpanElement',
        // ScrollArea
        'ScrollAreaPrimitive.Root': 'HTMLDivElement',
        'ScrollAreaPrimitive.Viewport': 'HTMLDivElement',
        'ScrollAreaPrimitive.Scrollbar': 'HTMLDivElement',
        'ScrollAreaPrimitive.Thumb': 'HTMLDivElement',
        // Select
        'SelectPrimitive.Root': 'HTMLDivElement',
        'SelectPrimitive.Trigger': 'HTMLButtonElement',
        'SelectPrimitive.Value': 'HTMLSpanElement',
        'SelectPrimitive.Content': 'HTMLDivElement',
        'SelectPrimitive.Viewport': 'HTMLDivElement',
        'SelectPrimitive.Item': 'HTMLDivElement',
        'SelectPrimitive.ItemText': 'HTMLSpanElement',
        'SelectPrimitive.ItemIndicator': 'HTMLSpanElement',
        'SelectPrimitive.ScrollUpButton': 'HTMLDivElement',
        'SelectPrimitive.ScrollDownButton': 'HTMLDivElement',
        'SelectPrimitive.Separator': 'HTMLDivElement',
        'SelectPrimitive.Label': 'HTMLDivElement',
        'SelectPrimitive.Group': 'HTMLDivElement',
        // Separator
        'SeparatorPrimitive.Root': 'HTMLDivElement',
        // Sheet (uses Dialog primitives)
        'SheetPrimitive.Root': 'HTMLDivElement',
        'SheetPrimitive.Trigger': 'HTMLButtonElement',
        'SheetPrimitive.Content': 'HTMLDivElement',
        'SheetPrimitive.Close': 'HTMLButtonElement',
        // Slider
        'SliderPrimitive.Root': 'HTMLSpanElement',
        'SliderPrimitive.Track': 'HTMLSpanElement',
        'SliderPrimitive.Range': 'HTMLSpanElement',
        'SliderPrimitive.Thumb': 'HTMLSpanElement',
        // Switch
        'SwitchPrimitive.Root': 'HTMLButtonElement',
        'SwitchPrimitive.Thumb': 'HTMLSpanElement',
        // Tabs
        'TabsPrimitive.Root': 'HTMLDivElement',
        'TabsPrimitive.List': 'HTMLDivElement',
        'TabsPrimitive.Trigger': 'HTMLButtonElement',
        'TabsPrimitive.Content': 'HTMLDivElement',
        // Toast
        'ToastPrimitive.Root': 'HTMLLIElement',
        'ToastPrimitive.Action': 'HTMLButtonElement',
        'ToastPrimitive.Close': 'HTMLButtonElement',
        'ToastPrimitive.Title': 'HTMLDivElement',
        'ToastPrimitive.Description': 'HTMLDivElement',
        'ToastPrimitive.Viewport': 'HTMLOListElement',
        // Toggle
        'TogglePrimitive.Root': 'HTMLButtonElement',
        // Toggle Group
        'ToggleGroupPrimitive.Root': 'HTMLDivElement',
        'ToggleGroupPrimitive.Item': 'HTMLButtonElement',
        // Tooltip
        'TooltipPrimitive.Root': 'HTMLDivElement',
        'TooltipPrimitive.Trigger': 'HTMLButtonElement',
        'TooltipPrimitive.Content': 'HTMLDivElement',
    };
    // Normalize whitespace (type might come from multi-line source)
    const normalizedType = rawType.replace(/\s+/g, ' ').trim();
    // Handle React.ElementRef<typeof X> pattern
    const elementRefMatch = normalizedType.match(/React\.ElementRef\s*<\s*typeof\s+([^>]+)\s*>/);
    if (elementRefMatch) {
        const primitiveRef = elementRefMatch[1].trim();
        // Check exact match first
        if (radixToHtmlElement[primitiveRef]) {
            return radixToHtmlElement[primitiveRef];
        }
        // Try to extract the last part (e.g., "Root" from "LabelPrimitive.Root")
        const parts = primitiveRef.split('.');
        if (parts.length >= 2) {
            const lastPart = parts[parts.length - 1];
            if (radixToHtmlElement[lastPart]) {
                return radixToHtmlElement[lastPart];
            }
        }
        // Default for unknown primitives
        return 'HTMLElement';
    }
    // Handle ElementRef<typeof X> without React prefix
    const simpleElementRefMatch = normalizedType.match(/ElementRef\s*<\s*typeof\s+([^>]+)\s*>/);
    if (simpleElementRefMatch) {
        const primitiveRef = simpleElementRefMatch[1].trim();
        if (radixToHtmlElement[primitiveRef]) {
            return radixToHtmlElement[primitiveRef];
        }
        const parts = primitiveRef.split('.');
        if (parts.length >= 2) {
            const lastPart = parts[parts.length - 1];
            if (radixToHtmlElement[lastPart]) {
                return radixToHtmlElement[lastPart];
            }
        }
        return 'HTMLElement';
    }
    // Return original if no transformation needed
    return rawType;
}
/**
 * Analyzes a source file to extract React.forwardRef configuration.
 *
 * forwardRef pattern example:
 * ```ts
 * const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 *   ({ className, ...props }, ref) => (
 *     <button ref={ref} {...props} />
 *   )
 * )
 * ```
 */
export function analyzeForwardRef(sourceFile) {
    // Find forwardRef calls (both React.forwardRef and forwardRef)
    const forwardRefCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter(call => {
        const expression = call.getExpression();
        const text = expression.getText();
        return text === 'forwardRef' ||
            text === 'React.forwardRef' ||
            text.endsWith('.forwardRef');
    });
    if (forwardRefCalls.length === 0) {
        return undefined;
    }
    const forwardRefCall = forwardRefCalls[0];
    // Get type arguments: forwardRef<HTMLButtonElement, ButtonProps>
    const typeArguments = forwardRefCall.getTypeArguments();
    let elementType = 'HTMLElement'; // Default
    if (typeArguments.length > 0) {
        const firstTypeArg = typeArguments[0];
        const rawType = firstTypeArg.getText();
        elementType = normalizeElementType(rawType);
    }
    // Find the ref parameter name from the arrow function
    let paramName = 'ref'; // Default
    const arrowFunction = forwardRefCall.getFirstDescendantByKind(SyntaxKind.ArrowFunction);
    if (arrowFunction) {
        const parameters = arrowFunction.getParameters();
        // forwardRef callback has (props, ref) signature
        if (parameters.length >= 2) {
            paramName = parameters[1].getName();
        }
    }
    // Also check for function expression
    const functionExpression = forwardRefCall.getFirstDescendantByKind(SyntaxKind.FunctionExpression);
    if (functionExpression && paramName === 'ref') {
        const parameters = functionExpression.getParameters();
        if (parameters.length >= 2) {
            paramName = parameters[1].getName();
        }
    }
    return {
        elementType,
        paramName,
    };
}
/**
 * Checks if a component uses forwardRef.
 */
export function hasForwardRef(sourceFile) {
    return analyzeForwardRef(sourceFile) !== undefined;
}
/**
 * Extracts the component name from a forwardRef declaration.
 * e.g., "const Button = React.forwardRef..." returns "Button"
 */
export function getForwardRefComponentName(sourceFile) {
    const forwardRefCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter(call => {
        const text = call.getExpression().getText();
        return text === 'forwardRef' ||
            text === 'React.forwardRef' ||
            text.endsWith('.forwardRef');
    });
    if (forwardRefCalls.length === 0) {
        return undefined;
    }
    const variableDeclaration = forwardRefCalls[0].getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
    return variableDeclaration?.getName();
}
//# sourceMappingURL=forward-ref.js.map