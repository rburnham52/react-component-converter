import { Project, SourceFile, VariableDeclaration, FunctionDeclaration, SyntaxKind, Node } from 'ts-morph';
import { parseJsx } from '@builder.io/mitosis';
import type { MitosisComponent, MitosisNode } from '@builder.io/mitosis';
import type {
  ExtendedMitosisComponent,
  ReactComponentMeta,
  ParseResult,
  ParserOptions,
  PropDefinition,
  ComponentDefinition,
  CvaConfig,
  OriginalImport,
} from '@react-component-converter/core';

import {
  analyzeCva,
  analyzeAllCvaDefinitions,
  analyzeForwardRef,
  hasForwardRef,
  getForwardRefComponentName,
  analyzeProps,
  analyzePropsForComponent,
  analyzeImports,
  usesCnUtility,
  extractJsxFromComponent,
  extractJsxForNamedComponent,
} from './analyzers/index.js';

/**
 * Parses a React component file and returns the Mitosis IR with React-specific metadata.
 * Supports files with multiple component definitions (e.g., Card, CardHeader, CardContent, etc.)
 */
export async function parseComponent(
  code: string,
  options: ParserOptions = {}
): Promise<ParseResult> {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Create ts-morph project for analysis
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      jsx: 2, // React
      target: 99, // ESNext
      module: 99, // ESNext
    },
  });

  const sourceFile = project.createSourceFile('component.tsx', code);

  // Extract all CVA definitions in the file
  const cvaConfigs = analyzeAllCvaDefinitions(sourceFile);

  // Get the primary CVA (usually the first one or the one with 'Variants' in the name)
  const primaryCvaName = Object.keys(cvaConfigs)[0];
  const primaryCva = primaryCvaName ? cvaConfigs[primaryCvaName] : undefined;

  // Extract imports
  const originalImports = analyzeImports(sourceFile);
  const usesCn = usesCnUtility(sourceFile);

  // Find all component definitions in the file
  const componentDefs = findAllComponentDefinitions(sourceFile, cvaConfigs);

  // Build shared metadata
  const sharedMeta = {
    cvaConfigs,
    imports: originalImports,
    usesCn,
  };

  // Process each component definition
  const components: ComponentDefinition[] = [];
  for (const def of componentDefs) {
    const { name, isReExport, reExportSource, baseClasses, forwardRefConfig, propsCode, usedCvaName } = def;

    // Skip re-exports for JSX extraction - they don't have their own JSX
    let jsxChildren: MitosisNode[] = [];
    if (!isReExport) {
      // Extract JSX for this specific component
      jsxChildren = extractJsxForNamedComponent(sourceFile, name);
    }

    // Build React-specific metadata for this component
    // Only include CVA if the component actually uses it
    const reactMeta: ReactComponentMeta = {
      cva: usedCvaName ? cvaConfigs[usedCvaName] : undefined,
      forwardRef: forwardRefConfig,
      usesCn,
      originalImports,
    };

    // Analyze props for this component
    const props = analyzePropsForComponent(sourceFile, name, reactMeta.cva);

    // Create a Mitosis component structure with the extracted JSX children
    const mitosisComponent = createComponentStructure(name, props, baseClasses, jsxChildren);

    // Build the ExtendedMitosisComponent
    const component: ExtendedMitosisComponent = {
      ...mitosisComponent,
      meta: {
        ...mitosisComponent.meta,
        reactMeta,
      },
    } as ExtendedMitosisComponent;

    components.push({
      name,
      component,
      props,
      isReExport,
      reExportSource,
      baseClasses,
    });
  }

  // Determine the primary component (first non-re-export, or first component)
  const primaryComponent = components.find(c => !c.isReExport) || components[0];

  // Check for Radix imports
  const radixImports = originalImports.filter(imp => imp.category === 'radix');
  if (radixImports.length > 0) {
    warnings.push(
      `Component uses Radix UI primitives (${radixImports.map(i => i.source).join(', ')}). ` +
      `These will be mapped to equivalent libraries in the target framework.`
    );
  }

  return {
    component: primaryComponent?.component || createEmptyComponent('Component'),
    components,
    props: primaryComponent?.props || [],
    warnings,
    errors,
    sharedMeta,
  };
}

/**
 * Finds all component definitions in the source file.
 * Handles: forwardRef, function declarations, arrow functions, and re-exports.
 */
function findAllComponentDefinitions(
  sourceFile: SourceFile,
  cvaConfigs: Record<string, CvaConfig>
): Array<{
  name: string;
  isReExport: boolean;
  reExportSource?: string;
  baseClasses?: string;
  forwardRefConfig?: { elementType: string; paramName: string };
  propsCode?: string;
  usedCvaName?: string;
}> {
  const components: Array<{
    name: string;
    isReExport: boolean;
    reExportSource?: string;
    baseClasses?: string;
    forwardRefConfig?: { elementType: string; paramName: string };
    propsCode?: string;
    usedCvaName?: string;
  }> = [];

  // Track what's exported
  const exportedNames = new Set<string>();
  const exportDeclarations = sourceFile.getExportDeclarations();
  for (const exp of exportDeclarations) {
    for (const namedExport of exp.getNamedExports()) {
      exportedNames.add(namedExport.getName());
    }
  }

  // Also check for export statements at the end of the file
  const exportStatements = sourceFile.getStatements().filter(s =>
    s.getKind() === SyntaxKind.ExportDeclaration
  );

  // Find all variable declarations
  const variableStatements = sourceFile.getVariableStatements();
  for (const statement of variableStatements) {
    for (const declaration of statement.getDeclarations()) {
      const name = declaration.getName();
      const initializer = declaration.getInitializer();

      if (!initializer) continue;

      const initText = initializer.getText();

      // Check if it's a forwardRef component
      if (initText.includes('forwardRef') || initText.includes('React.forwardRef')) {
        const forwardRefInfo = extractForwardRefInfo(declaration);
        const baseClasses = extractBaseClasses(initializer.getText());
        const usedCva = findUsedCva(initText, cvaConfigs);

        components.push({
          name,
          isReExport: false,
          baseClasses,
          forwardRefConfig: forwardRefInfo,
          usedCvaName: usedCva,
        });
      }
      // Check if it's a simple re-export of a primitive (e.g., const Tabs = TabsPrimitive.Root)
      else if (initText.includes('Primitive.') || initText.includes('Primitives.')) {
        components.push({
          name,
          isReExport: true,
          reExportSource: initText,
        });
      }
      // Check if it's an arrow function component
      else if (initText.includes('=>') && (initText.includes('<') || initText.includes('return'))) {
        // Likely a function component
        const baseClasses = extractBaseClasses(initText);
        const usedCva = findUsedCva(initText, cvaConfigs);
        components.push({
          name,
          isReExport: false,
          baseClasses,
          usedCvaName: usedCva,
        });
      }
    }
  }

  // Find function declarations (e.g., function Badge() {})
  const functionDeclarations = sourceFile.getFunctions();
  for (const func of functionDeclarations) {
    const name = func.getName();
    if (!name) continue;

    const bodyText = func.getBody()?.getText() || '';
    const baseClasses = extractBaseClasses(bodyText);
    const usedCva = findUsedCva(bodyText, cvaConfigs);

    components.push({
      name,
      isReExport: false,
      baseClasses,
      usedCvaName: usedCva,
    });
  }

  return components;
}

/**
 * Extracts forwardRef type information from a variable declaration.
 */
function extractForwardRefInfo(declaration: VariableDeclaration): { elementType: string; paramName: string } | undefined {
  const initText = declaration.getInitializer()?.getText() || '';

  // Extract the full first type argument from forwardRef<T, ...>
  // Need to handle complex types like React.ElementRef<typeof LabelPrimitive.Root>
  let elementType = 'HTMLElement';

  // Find the start of the type argument
  const forwardRefIndex = initText.search(/forwardRef\s*</);
  if (forwardRefIndex !== -1) {
    const afterForwardRef = initText.slice(forwardRefIndex);
    const typeStartIndex = afterForwardRef.indexOf('<') + 1;

    // Count angle brackets to find the end of the first type argument
    let depth = 1;
    let endIndex = typeStartIndex;
    for (let i = typeStartIndex; i < afterForwardRef.length; i++) {
      const char = afterForwardRef[i];
      if (char === '<') depth++;
      else if (char === '>') depth--;
      else if (char === ',' && depth === 1) {
        endIndex = i;
        break;
      }
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }

    const rawType = afterForwardRef.slice(typeStartIndex, endIndex).trim();
    elementType = normalizeElementType(rawType);
  }

  // Match the ref parameter name
  const refMatch = initText.match(/\(\s*\{[^}]*\}\s*,\s*(\w+)\s*\)/);
  const paramName = refMatch ? refMatch[1] : 'ref';

  return { elementType, paramName };
}

/**
 * Normalizes React-specific element types to standard HTML element types.
 */
function normalizeElementType(rawType: string): string {
  // If it's already a standard HTML element type, return as-is
  if (rawType.startsWith('HTML') && rawType.endsWith('Element')) {
    return rawType;
  }

  // Map Radix primitive names to HTML elements
  const radixToHtmlElement: Record<string, string> = {
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

    // Select
    'SelectPrimitive.Trigger': 'HTMLButtonElement',
    'SelectPrimitive.Content': 'HTMLDivElement',
    'SelectPrimitive.Item': 'HTMLDivElement',
    'SelectPrimitive.Value': 'HTMLSpanElement',

    // Accordion
    'AccordionPrimitive.Root': 'HTMLDivElement',
    'AccordionPrimitive.Item': 'HTMLDivElement',
    'AccordionPrimitive.Trigger': 'HTMLButtonElement',
    'AccordionPrimitive.Content': 'HTMLDivElement',

    // Tabs
    'TabsPrimitive.Root': 'HTMLDivElement',
    'TabsPrimitive.List': 'HTMLDivElement',
    'TabsPrimitive.Trigger': 'HTMLButtonElement',
    'TabsPrimitive.Content': 'HTMLDivElement',

    // Tooltip
    'TooltipPrimitive.Root': 'HTMLDivElement',
    'TooltipPrimitive.Trigger': 'HTMLButtonElement',
    'TooltipPrimitive.Content': 'HTMLDivElement',

    // Popover
    'PopoverPrimitive.Root': 'HTMLDivElement',
    'PopoverPrimitive.Trigger': 'HTMLButtonElement',
    'PopoverPrimitive.Content': 'HTMLDivElement',
    'PopoverPrimitive.Close': 'HTMLButtonElement',

    // Switch
    'SwitchPrimitive.Root': 'HTMLButtonElement',
    'SwitchPrimitive.Thumb': 'HTMLSpanElement',

    // Checkbox
    'CheckboxPrimitive.Root': 'HTMLButtonElement',
    'CheckboxPrimitive.Indicator': 'HTMLSpanElement',

    // Radio Group
    'RadioGroupPrimitive.Root': 'HTMLDivElement',
    'RadioGroupPrimitive.Item': 'HTMLButtonElement',
    'RadioGroupPrimitive.Indicator': 'HTMLSpanElement',

    // Progress
    'ProgressPrimitive.Root': 'HTMLDivElement',
    'ProgressPrimitive.Indicator': 'HTMLDivElement',

    // Slider
    'SliderPrimitive.Root': 'HTMLSpanElement',
    'SliderPrimitive.Track': 'HTMLSpanElement',
    'SliderPrimitive.Range': 'HTMLSpanElement',
    'SliderPrimitive.Thumb': 'HTMLSpanElement',

    // Avatar
    'AvatarPrimitive.Root': 'HTMLSpanElement',
    'AvatarPrimitive.Image': 'HTMLImageElement',
    'AvatarPrimitive.Fallback': 'HTMLSpanElement',

    // Separator
    'SeparatorPrimitive.Root': 'HTMLDivElement',

    // ScrollArea
    'ScrollAreaPrimitive.Root': 'HTMLDivElement',
    'ScrollAreaPrimitive.Viewport': 'HTMLDivElement',
    'ScrollAreaPrimitive.Scrollbar': 'HTMLDivElement',
    'ScrollAreaPrimitive.Thumb': 'HTMLDivElement',

    // Toggle
    'TogglePrimitive.Root': 'HTMLButtonElement',

    // Context Menu
    'ContextMenuPrimitive.Root': 'HTMLDivElement',
    'ContextMenuPrimitive.Trigger': 'HTMLSpanElement',
    'ContextMenuPrimitive.Content': 'HTMLDivElement',
    'ContextMenuPrimitive.Item': 'HTMLDivElement',

    // Dropdown Menu
    'DropdownMenuPrimitive.Root': 'HTMLDivElement',
    'DropdownMenuPrimitive.Trigger': 'HTMLButtonElement',
    'DropdownMenuPrimitive.Content': 'HTMLDivElement',
    'DropdownMenuPrimitive.Item': 'HTMLDivElement',

    // Navigation Menu
    'NavigationMenuPrimitive.Root': 'HTMLElement',
    'NavigationMenuPrimitive.List': 'HTMLUListElement',
    'NavigationMenuPrimitive.Item': 'HTMLLIElement',
    'NavigationMenuPrimitive.Trigger': 'HTMLButtonElement',
    'NavigationMenuPrimitive.Content': 'HTMLDivElement',
    'NavigationMenuPrimitive.Link': 'HTMLAnchorElement',

    // Menubar
    'MenubarPrimitive.Root': 'HTMLDivElement',
    'MenubarPrimitive.Trigger': 'HTMLButtonElement',
    'MenubarPrimitive.Content': 'HTMLDivElement',
    'MenubarPrimitive.Item': 'HTMLDivElement',

    // AlertDialog
    'AlertDialogPrimitive.Root': 'HTMLDivElement',
    'AlertDialogPrimitive.Trigger': 'HTMLButtonElement',
    'AlertDialogPrimitive.Content': 'HTMLDivElement',
    'AlertDialogPrimitive.Title': 'HTMLHeadingElement',
    'AlertDialogPrimitive.Description': 'HTMLParagraphElement',
    'AlertDialogPrimitive.Action': 'HTMLButtonElement',
    'AlertDialogPrimitive.Cancel': 'HTMLButtonElement',

    // HoverCard
    'HoverCardPrimitive.Root': 'HTMLDivElement',
    'HoverCardPrimitive.Trigger': 'HTMLAnchorElement',
    'HoverCardPrimitive.Content': 'HTMLDivElement',

    // Collapsible
    'CollapsiblePrimitive.Root': 'HTMLDivElement',
    'CollapsiblePrimitive.Trigger': 'HTMLButtonElement',
    'CollapsiblePrimitive.Content': 'HTMLDivElement',

    // Toast
    'ToastPrimitive.Root': 'HTMLLIElement',
    'ToastPrimitive.Action': 'HTMLButtonElement',
    'ToastPrimitive.Close': 'HTMLButtonElement',
    'ToastPrimitive.Title': 'HTMLDivElement',
    'ToastPrimitive.Description': 'HTMLDivElement',
    'ToastPrimitive.Viewport': 'HTMLOListElement',

    // Toggle Group
    'ToggleGroupPrimitive.Root': 'HTMLDivElement',
    'ToggleGroupPrimitive.Item': 'HTMLButtonElement',
  };

  // Normalize whitespace
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
 * Finds if a component uses a CVA function by checking if the CVA name is called in the code.
 */
function findUsedCva(code: string, cvaConfigs: Record<string, CvaConfig>): string | undefined {
  for (const cvaName of Object.keys(cvaConfigs)) {
    // Check if the CVA function is called (e.g., alertVariants({ variant }))
    const callPattern = new RegExp(`${cvaName}\\s*\\(`);
    if (callPattern.test(code)) {
      return cvaName;
    }
  }
  return undefined;
}

/**
 * Extracts base classes from component code (from cn() calls or className).
 */
function extractBaseClasses(code: string): string | undefined {
  // Look for cn(..., "classes") or className="classes"
  const cnMatch = code.match(/cn\s*\(\s*["'`]([^"'`]+)["'`]/);
  if (cnMatch) return cnMatch[1];

  const classNameMatch = code.match(/className\s*=\s*["'`]([^"'`]+)["'`]/);
  if (classNameMatch) return classNameMatch[1];

  return undefined;
}



/**
 * Creates a Mitosis component structure with optional JSX children.
 */
function createComponentStructure(
  name: string,
  props: PropDefinition[],
  baseClasses?: string,
  children?: MitosisNode[]
): MitosisComponent {
  const mitosisProps: MitosisComponent['props'] = {};
  for (const prop of props) {
    mitosisProps[prop.name] = {
      propertyType: 'normal',
      optional: prop.optional,
    };
  }

  return {
    '@type': '@builder.io/mitosis/component',
    name,
    imports: [],
    exports: {},
    inputs: [],
    meta: {
      baseClasses,
    },
    state: {},
    props: mitosisProps,
    refs: {},
    hooks: {
      onMount: [],
      onEvent: [],
    },
    children: children || [],
    context: { get: {}, set: {} },
    subComponents: [],
  } as unknown as MitosisComponent;
}

/**
 * Creates an empty component structure.
 */
function createEmptyComponent(name: string): ExtendedMitosisComponent {
  return {
    '@type': '@builder.io/mitosis/component',
    name,
    imports: [],
    exports: {},
    inputs: [],
    meta: {
      reactMeta: {
        usesCn: false,
        originalImports: [],
      },
    },
    state: {},
    props: {},
    refs: {},
    hooks: {
      onMount: [],
      onEvent: [],
    },
    children: [],
    context: { get: {}, set: {} },
    subComponents: [],
  } as unknown as ExtendedMitosisComponent;
}

/**
 * Parses a component from a file path.
 */
export async function parseComponentFile(
  filePath: string,
  options: ParserOptions = {}
): Promise<ParseResult> {
  const fs = await import('fs/promises');
  const code = await fs.readFile(filePath, 'utf-8');
  return parseComponent(code, options);
}
