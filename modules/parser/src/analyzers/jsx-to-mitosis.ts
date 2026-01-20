import { Node, SyntaxKind, JsxElement, JsxSelfClosingElement, JsxFragment, JsxExpression, JsxText, JsxAttribute, JsxSpreadAttribute, SourceFile, VariableDeclaration, FunctionDeclaration, ArrowFunction } from 'ts-morph';
import type { MitosisNode, Binding } from '@builder.io/mitosis';

/**
 * Converts a ts-morph JSX node tree to Mitosis node format.
 * This allows us to use Mitosis generators while parsing standard React code.
 */
export function jsxToMitosisNodes(jsxNode: Node): MitosisNode[] {
  const nodes: MitosisNode[] = [];

  if (Node.isJsxElement(jsxNode)) {
    nodes.push(convertJsxElement(jsxNode));
  } else if (Node.isJsxSelfClosingElement(jsxNode)) {
    nodes.push(convertJsxSelfClosingElement(jsxNode));
  } else if (Node.isJsxFragment(jsxNode)) {
    nodes.push(...convertJsxFragment(jsxNode));
  } else if (Node.isJsxText(jsxNode)) {
    const text = jsxNode.getText().trim();
    if (text) {
      nodes.push(createTextNode(text));
    }
  } else if (Node.isJsxExpression(jsxNode)) {
    const expr = convertJsxExpression(jsxNode);
    if (expr) {
      nodes.push(expr);
    }
  }

  return nodes;
}

/**
 * Converts a JsxElement (opening + closing tags with children)
 */
function convertJsxElement(element: JsxElement): MitosisNode {
  const openingElement = element.getOpeningElement();
  const tagName = openingElement.getTagNameNode().getText();

  const { properties, bindings } = convertJsxAttributes(openingElement.getAttributes());

  const children: MitosisNode[] = [];
  for (const child of element.getJsxChildren()) {
    children.push(...jsxToMitosisNodes(child));
  }

  return createMitosisNode(tagName, properties, bindings, children);
}

/**
 * Converts a self-closing JSX element
 */
function convertJsxSelfClosingElement(element: JsxSelfClosingElement): MitosisNode {
  const tagName = element.getTagNameNode().getText();
  const { properties, bindings } = convertJsxAttributes(element.getAttributes());

  return createMitosisNode(tagName, properties, bindings, []);
}

/**
 * Converts a JSX fragment to its children
 */
function convertJsxFragment(fragment: JsxFragment): MitosisNode[] {
  const children: MitosisNode[] = [];
  for (const child of fragment.getJsxChildren()) {
    children.push(...jsxToMitosisNodes(child));
  }
  return children;
}

/**
 * Converts a JSX expression like {children} or {condition && <X/>}
 */
function convertJsxExpression(expr: JsxExpression): MitosisNode | null {
  const expression = expr.getExpression();
  if (!expression) return null;

  const exprText = expression.getText();

  // Handle {children} or {props.children}
  if (exprText === 'children' || exprText === 'props.children') {
    return {
      '@type': '@builder.io/mitosis/node',
      name: 'Slot',
      meta: {},
      scope: {},
      properties: {},
      bindings: {},
      children: [],
    } as MitosisNode;
  }

  // Handle spread: {...props}
  if (exprText.startsWith('...')) {
    // This is handled at the attribute level, not as a child
    return null;
  }

  // Handle conditional rendering: {condition && <Element/>}
  if (Node.isBinaryExpression(expression) && expression.getOperatorToken().getText() === '&&') {
    const condition = expression.getLeft().getText();
    const rightExpr = expression.getRight();

    // Try to get the JSX from the right side
    if (Node.isJsxElement(rightExpr) || Node.isJsxSelfClosingElement(rightExpr)) {
      const childNodes = jsxToMitosisNodes(rightExpr);
      if (childNodes.length > 0) {
        const childNode = childNodes[0];
        // Add the condition as a binding
        return {
          '@type': '@builder.io/mitosis/node',
          name: 'Show',
          meta: {},
          scope: {},
          properties: {},
          bindings: {
            when: { code: condition, type: 'single', bindingType: 'expression' },
          },
          children: [childNode],
        } as MitosisNode;
      }
    }
  }

  // Handle ternary: {condition ? <A/> : <B/>}
  if (Node.isConditionalExpression(expression)) {
    const condition = expression.getCondition().getText();
    const whenTrue = expression.getWhenTrue();
    const whenFalse = expression.getWhenFalse();

    const trueNodes = Node.isJsxElement(whenTrue) || Node.isJsxSelfClosingElement(whenTrue)
      ? jsxToMitosisNodes(whenTrue)
      : [];
    const falseNodes = Node.isJsxElement(whenFalse) || Node.isJsxSelfClosingElement(whenFalse)
      ? jsxToMitosisNodes(whenFalse)
      : [];

    if (trueNodes.length > 0) {
      return {
        '@type': '@builder.io/mitosis/node',
        name: 'Show',
        meta: {},
        scope: {},
        properties: {},
        bindings: {
          when: { code: condition, type: 'single', bindingType: 'expression' },
        },
        children: trueNodes,
      } as MitosisNode;
    }
  }

  // For other expressions, create a text binding node
  return {
    '@type': '@builder.io/mitosis/node',
    name: '',
    meta: {},
    scope: {},
    properties: {},
    bindings: {
      _text: { code: exprText, type: 'single', bindingType: 'expression' },
    },
    children: [],
  } as MitosisNode;
}

/**
 * Converts JSX attributes to Mitosis properties and bindings
 */
function convertJsxAttributes(
  attributes: (JsxAttribute | JsxSpreadAttribute)[]
): { properties: Record<string, string>; bindings: Record<string, Binding> } {
  const properties: Record<string, string> = {};
  const bindings: Record<string, Binding> = {};

  for (const attr of attributes) {
    if (Node.isJsxSpreadAttribute(attr)) {
      // Handle {...props} or {...restProps}
      const spreadExpr = attr.getExpression().getText();
      bindings['...'] = { code: spreadExpr, type: 'spread', spreadType: 'normal' };
    } else if (Node.isJsxAttribute(attr)) {
      const name = attr.getNameNode().getText();
      const initializer = attr.getInitializer();

      if (!initializer) {
        // Boolean attribute like `disabled`
        properties[name] = 'true';
      } else if (Node.isStringLiteral(initializer)) {
        // Static string: prop="value"
        properties[name] = initializer.getLiteralText();
      } else if (Node.isJsxExpression(initializer)) {
        // Dynamic binding: prop={expression}
        const expr = initializer.getExpression();
        if (expr) {
          const code = expr.getText();
          // Determine if this is a function or expression binding
          const isEventHandler = name.startsWith('on');
          bindings[name] = {
            code,
            type: 'single',
            bindingType: isEventHandler ? 'function' : 'expression'
          };
        }
      }
    }
  }

  return { properties, bindings };
}

/**
 * Maps Radix primitive component names to their native HTML equivalents.
 */
const RADIX_TO_HTML_ELEMENT: Record<string, string> = {
  // Separator
  'SeparatorPrimitive.Root': 'div',

  // Label
  'LabelPrimitive.Root': 'label',

  // Switch
  'SwitchPrimitive.Root': 'button',
  'SwitchPrimitive.Thumb': 'span',
  'SwitchPrimitives.Root': 'button',
  'SwitchPrimitives.Thumb': 'span',

  // Checkbox
  'CheckboxPrimitive.Root': 'button',
  'CheckboxPrimitive.Indicator': 'span',

  // Progress
  'ProgressPrimitive.Root': 'div',
  'ProgressPrimitive.Indicator': 'div',

  // Slider
  'SliderPrimitive.Root': 'div',
  'SliderPrimitive.Track': 'div',
  'SliderPrimitive.Range': 'div',
  'SliderPrimitive.Thumb': 'div',

  // Avatar
  'AvatarPrimitive.Root': 'span',
  'AvatarPrimitive.Image': 'img',
  'AvatarPrimitive.Fallback': 'span',

  // Tabs
  'TabsPrimitive.Root': 'div',
  'TabsPrimitive.List': 'div',
  'TabsPrimitive.Trigger': 'button',
  'TabsPrimitive.Content': 'div',

  // Accordion
  'AccordionPrimitive.Root': 'div',
  'AccordionPrimitive.Item': 'div',
  'AccordionPrimitive.Trigger': 'button',
  'AccordionPrimitive.Header': 'h3',
  'AccordionPrimitive.Content': 'div',

  // Dialog
  'DialogPrimitive.Root': 'div',
  'DialogPrimitive.Portal': 'div',
  'DialogPrimitive.Overlay': 'div',
  'DialogPrimitive.Content': 'div',
  'DialogPrimitive.Close': 'button',
  'DialogPrimitive.Title': 'h2',
  'DialogPrimitive.Description': 'p',
  'DialogPrimitive.Trigger': 'button',

  // Alert Dialog
  'AlertDialogPrimitive.Root': 'div',
  'AlertDialogPrimitive.Portal': 'div',
  'AlertDialogPrimitive.Overlay': 'div',
  'AlertDialogPrimitive.Content': 'div',
  'AlertDialogPrimitive.Title': 'h2',
  'AlertDialogPrimitive.Description': 'p',
  'AlertDialogPrimitive.Action': 'button',
  'AlertDialogPrimitive.Cancel': 'button',
  'AlertDialogPrimitive.Trigger': 'button',

  // Popover
  'PopoverPrimitive.Root': 'div',
  'PopoverPrimitive.Portal': 'div',
  'PopoverPrimitive.Content': 'div',
  'PopoverPrimitive.Trigger': 'button',
  'PopoverPrimitive.Close': 'button',
  'PopoverPrimitive.Arrow': 'div',

  // Tooltip
  'TooltipPrimitive.Root': 'div',
  'TooltipPrimitive.Portal': 'div',
  'TooltipPrimitive.Content': 'div',
  'TooltipPrimitive.Trigger': 'button',
  'TooltipPrimitive.Arrow': 'div',
  'TooltipPrimitive.Provider': 'div',

  // Dropdown Menu
  'DropdownMenuPrimitive.Root': 'div',
  'DropdownMenuPrimitive.Portal': 'div',
  'DropdownMenuPrimitive.Content': 'div',
  'DropdownMenuPrimitive.Trigger': 'button',
  'DropdownMenuPrimitive.Item': 'div',
  'DropdownMenuPrimitive.CheckboxItem': 'div',
  'DropdownMenuPrimitive.RadioItem': 'div',
  'DropdownMenuPrimitive.Label': 'div',
  'DropdownMenuPrimitive.Separator': 'div',
  'DropdownMenuPrimitive.Group': 'div',
  'DropdownMenuPrimitive.Sub': 'div',
  'DropdownMenuPrimitive.SubTrigger': 'div',
  'DropdownMenuPrimitive.SubContent': 'div',
  'DropdownMenuPrimitive.ItemIndicator': 'span',

  // Select
  'SelectPrimitive.Root': 'div',
  'SelectPrimitive.Trigger': 'button',
  'SelectPrimitive.Value': 'span',
  'SelectPrimitive.Icon': 'span',
  'SelectPrimitive.Portal': 'div',
  'SelectPrimitive.Content': 'div',
  'SelectPrimitive.Viewport': 'div',
  'SelectPrimitive.Item': 'div',
  'SelectPrimitive.ItemText': 'span',
  'SelectPrimitive.ItemIndicator': 'span',
  'SelectPrimitive.ScrollUpButton': 'div',
  'SelectPrimitive.ScrollDownButton': 'div',
  'SelectPrimitive.Group': 'div',
  'SelectPrimitive.Label': 'div',
  'SelectPrimitive.Separator': 'div',

  // Radio Group
  'RadioGroupPrimitive.Root': 'div',
  'RadioGroupPrimitive.Item': 'button',
  'RadioGroupPrimitive.Indicator': 'span',

  // Toggle
  'TogglePrimitive.Root': 'button',

  // Toggle Group
  'ToggleGroupPrimitive.Root': 'div',
  'ToggleGroupPrimitive.Item': 'button',

  // Scroll Area
  'ScrollAreaPrimitive.Root': 'div',
  'ScrollAreaPrimitive.Viewport': 'div',
  'ScrollAreaPrimitive.Scrollbar': 'div',
  'ScrollAreaPrimitive.Thumb': 'div',
  'ScrollAreaPrimitive.Corner': 'div',

  // Collapsible
  'CollapsiblePrimitive.Root': 'div',
  'CollapsiblePrimitive.Trigger': 'button',
  'CollapsiblePrimitive.Content': 'div',

  // Context Menu
  'ContextMenuPrimitive.Root': 'div',
  'ContextMenuPrimitive.Portal': 'div',
  'ContextMenuPrimitive.Content': 'div',
  'ContextMenuPrimitive.Trigger': 'span',
  'ContextMenuPrimitive.Item': 'div',
  'ContextMenuPrimitive.CheckboxItem': 'div',
  'ContextMenuPrimitive.RadioItem': 'div',
  'ContextMenuPrimitive.Label': 'div',
  'ContextMenuPrimitive.Separator': 'div',
  'ContextMenuPrimitive.Group': 'div',
  'ContextMenuPrimitive.Sub': 'div',
  'ContextMenuPrimitive.SubTrigger': 'div',
  'ContextMenuPrimitive.SubContent': 'div',
  'ContextMenuPrimitive.ItemIndicator': 'span',

  // Menubar
  'MenubarPrimitive.Root': 'div',
  'MenubarPrimitive.Menu': 'div',
  'MenubarPrimitive.Trigger': 'button',
  'MenubarPrimitive.Portal': 'div',
  'MenubarPrimitive.Content': 'div',
  'MenubarPrimitive.Item': 'div',
  'MenubarPrimitive.CheckboxItem': 'div',
  'MenubarPrimitive.RadioItem': 'div',
  'MenubarPrimitive.Label': 'div',
  'MenubarPrimitive.Separator': 'div',
  'MenubarPrimitive.Group': 'div',
  'MenubarPrimitive.Sub': 'div',
  'MenubarPrimitive.SubTrigger': 'div',
  'MenubarPrimitive.SubContent': 'div',
  'MenubarPrimitive.ItemIndicator': 'span',

  // Navigation Menu
  'NavigationMenuPrimitive.Root': 'nav',
  'NavigationMenuPrimitive.List': 'ul',
  'NavigationMenuPrimitive.Item': 'li',
  'NavigationMenuPrimitive.Trigger': 'button',
  'NavigationMenuPrimitive.Content': 'div',
  'NavigationMenuPrimitive.Link': 'a',
  'NavigationMenuPrimitive.Viewport': 'div',
  'NavigationMenuPrimitive.Indicator': 'div',

  // Hover Card
  'HoverCardPrimitive.Root': 'div',
  'HoverCardPrimitive.Trigger': 'a',
  'HoverCardPrimitive.Portal': 'div',
  'HoverCardPrimitive.Content': 'div',

  // Aspect Ratio
  'AspectRatioPrimitive.Root': 'div',

  // Toast
  'ToastPrimitive.Provider': 'div',
  'ToastPrimitive.Root': 'li',
  'ToastPrimitive.Title': 'div',
  'ToastPrimitive.Description': 'div',
  'ToastPrimitive.Close': 'button',
  'ToastPrimitive.Action': 'button',
  'ToastPrimitive.Viewport': 'ol',
};

/**
 * Normalizes a tag name, converting Radix primitives to native HTML elements.
 */
function normalizeTagName(tagName: string): string {
  // Check for exact match
  if (RADIX_TO_HTML_ELEMENT[tagName]) {
    return RADIX_TO_HTML_ELEMENT[tagName];
  }

  // Try converting plural to singular (SwitchPrimitives -> SwitchPrimitive)
  const singularForm = tagName.replace(/Primitives\./, 'Primitive.');
  if (RADIX_TO_HTML_ELEMENT[singularForm]) {
    return RADIX_TO_HTML_ELEMENT[singularForm];
  }

  // If it starts with a capital letter and contains a dot, it's likely a component
  // that should be converted to a native element
  if (tagName.includes('.') && /^[A-Z]/.test(tagName)) {
    // Try without the Primitive suffix variations
    const normalized = tagName.replace(/Primitives?\./, '');
    // If we still have a dot, use a reasonable default
    if (normalized.includes('.')) {
      return 'div';
    }
  }

  return tagName;
}

/**
 * Creates a Mitosis node
 */
function createMitosisNode(
  name: string,
  properties: Record<string, string>,
  bindings: Record<string, Binding>,
  children: MitosisNode[]
): MitosisNode {
  // Normalize Radix primitive names to HTML elements
  const normalizedName = normalizeTagName(name);

  return {
    '@type': '@builder.io/mitosis/node',
    name: normalizedName,
    meta: {},
    scope: {},
    properties,
    bindings,
    children,
  } as MitosisNode;
}

/**
 * Creates a text node
 */
function createTextNode(text: string): MitosisNode {
  return {
    '@type': '@builder.io/mitosis/node',
    name: '',
    meta: {},
    scope: {},
    properties: {
      _text: text,
    },
    bindings: {},
    children: [],
  } as MitosisNode;
}

/**
 * Extracts the JSX return statement from a React component
 */
export function extractJsxFromComponent(componentCode: string, sourceFile: any): MitosisNode[] {
  // Find return statements with JSX
  const returnStatements = sourceFile.getDescendantsOfKind(SyntaxKind.ReturnStatement);

  for (const returnStmt of returnStatements) {
    const expr = returnStmt.getExpression();
    if (expr && (Node.isJsxElement(expr) || Node.isJsxSelfClosingElement(expr) || Node.isJsxFragment(expr) || Node.isParenthesizedExpression(expr))) {
      // Handle parenthesized JSX: return (<div>...</div>)
      let jsxNode = expr;
      if (Node.isParenthesizedExpression(expr)) {
        const inner = expr.getExpression();
        if (Node.isJsxElement(inner) || Node.isJsxSelfClosingElement(inner) || Node.isJsxFragment(inner)) {
          jsxNode = inner;
        }
      }
      return jsxToMitosisNodes(jsxNode);
    }
  }

  return [];
}

/**
 * Extracts JSX for a specific named component in a multi-component file.
 * Handles forwardRef, arrow functions, and function declarations.
 */
export function extractJsxForNamedComponent(
  sourceFile: SourceFile,
  componentName: string
): MitosisNode[] {
  // Look for variable declaration with this name (handles forwardRef and arrow functions)
  const variableStatements = sourceFile.getVariableStatements();
  for (const statement of variableStatements) {
    for (const declaration of statement.getDeclarations()) {
      if (declaration.getName() === componentName) {
        const initializer = declaration.getInitializer();
        if (initializer) {
          const jsxNodes = extractJsxFromNode(initializer);
          if (jsxNodes.length > 0) {
            return jsxNodes;
          }
        }
      }
    }
  }

  // Look for function declaration with this name
  const functionDeclarations = sourceFile.getFunctions();
  for (const func of functionDeclarations) {
    if (func.getName() === componentName) {
      const body = func.getBody();
      if (body) {
        const jsxNodes = extractJsxFromNode(body);
        if (jsxNodes.length > 0) {
          return jsxNodes;
        }
      }
    }
  }

  return [];
}

/**
 * Extracts JSX from any node by finding return statements or arrow function bodies.
 */
function extractJsxFromNode(node: Node): MitosisNode[] {
  // Check if the node itself is JSX (for arrow functions with implicit return)
  if (Node.isJsxElement(node) || Node.isJsxSelfClosingElement(node) || Node.isJsxFragment(node)) {
    return jsxToMitosisNodes(node);
  }

  // Handle parenthesized expressions: () => (<div>...</div>)
  if (Node.isParenthesizedExpression(node)) {
    const inner = node.getExpression();
    if (Node.isJsxElement(inner) || Node.isJsxSelfClosingElement(inner) || Node.isJsxFragment(inner)) {
      return jsxToMitosisNodes(inner);
    }
  }

  // Handle arrow functions
  if (Node.isArrowFunction(node)) {
    const body = node.getBody();
    // Arrow function with expression body: () => <div>...</div>
    if (Node.isJsxElement(body) || Node.isJsxSelfClosingElement(body) || Node.isJsxFragment(body)) {
      return jsxToMitosisNodes(body);
    }
    // Parenthesized: () => (<div>...</div>)
    if (Node.isParenthesizedExpression(body)) {
      const inner = body.getExpression();
      if (Node.isJsxElement(inner) || Node.isJsxSelfClosingElement(inner) || Node.isJsxFragment(inner)) {
        return jsxToMitosisNodes(inner);
      }
    }
    // Arrow function with block body: () => { return <div>...</div> }
    if (Node.isBlock(body)) {
      return extractJsxFromReturnStatements(body);
    }
  }

  // Handle call expressions like React.forwardRef(...)
  if (Node.isCallExpression(node)) {
    const args = node.getArguments();
    for (const arg of args) {
      // forwardRef takes a function as argument
      if (Node.isArrowFunction(arg) || Node.isFunctionExpression(arg)) {
        const jsxNodes = extractJsxFromNode(arg);
        if (jsxNodes.length > 0) {
          return jsxNodes;
        }
      }
    }
  }

  // Handle function expressions
  if (Node.isFunctionExpression(node)) {
    const body = node.getBody();
    if (body) {
      return extractJsxFromReturnStatements(body);
    }
  }

  // For block statements, look for return statements
  if (Node.isBlock(node)) {
    return extractJsxFromReturnStatements(node);
  }

  // Generic fallback: look for return statements in descendants
  return extractJsxFromReturnStatements(node);
}

/**
 * Extracts JSX from return statements within a node.
 */
function extractJsxFromReturnStatements(node: Node): MitosisNode[] {
  const returnStatements = node.getDescendantsOfKind(SyntaxKind.ReturnStatement);

  for (const returnStmt of returnStatements) {
    const expr = returnStmt.getExpression();
    if (!expr) continue;

    // Direct JSX
    if (Node.isJsxElement(expr) || Node.isJsxSelfClosingElement(expr) || Node.isJsxFragment(expr)) {
      return jsxToMitosisNodes(expr);
    }

    // Parenthesized JSX: return (<div>...</div>)
    if (Node.isParenthesizedExpression(expr)) {
      const inner = expr.getExpression();
      if (Node.isJsxElement(inner) || Node.isJsxSelfClosingElement(inner) || Node.isJsxFragment(inner)) {
        return jsxToMitosisNodes(inner);
      }
    }
  }

  return [];
}
