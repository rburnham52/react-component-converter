import { SourceFile, SyntaxKind, InterfaceDeclaration, TypeAliasDeclaration, PropertySignature } from 'ts-morph';
import type { PropDefinition, CvaConfig } from '@react-component-converter/core';
import { getRadixPrimitiveProps } from '@react-component-converter/core';

/**
 * Info about Radix primitive usage extracted from component type
 */
export interface RadixPrimitiveInfo {
  packageName: string;
  componentName: string;
}

/**
 * Analyzes a source file to extract component props definitions.
 * Looks for interfaces/types ending with "Props" (e.g., ButtonProps).
 */
export function analyzeProps(sourceFile: SourceFile, cvaConfig?: CvaConfig): PropDefinition[] {
  const props: PropDefinition[] = [];

  // Find interface declarations ending with "Props"
  const propsInterface = sourceFile.getInterfaces()
    .find(iface => iface.getName().endsWith('Props'));

  // Find type alias declarations ending with "Props"
  const propsType = sourceFile.getTypeAliases()
    .find(alias => alias.getName().endsWith('Props'));

  if (propsInterface) {
    extractPropsFromInterface(propsInterface, props, cvaConfig);
  } else if (propsType) {
    extractPropsFromTypeAlias(propsType, props, cvaConfig);
  }

  return props;
}

/**
 * Extracts props from an interface declaration.
 */
function extractPropsFromInterface(
  iface: InterfaceDeclaration,
  props: PropDefinition[],
  cvaConfig?: CvaConfig
): void {
  // Get direct properties
  for (const prop of iface.getProperties()) {
    const propDef = extractPropertyDefinition(prop, cvaConfig);
    if (propDef) {
      props.push(propDef);
    }
  }

  // Check for extends clauses (e.g., extends React.ButtonHTMLAttributes<HTMLButtonElement>)
  const extendsExpressions = iface.getExtends();
  for (const ext of extendsExpressions) {
    const extText = ext.getText();

    // Check for VariantProps<typeof ...> to mark variant props
    if (extText.includes('VariantProps')) {
      // Props from VariantProps are handled via cvaConfig
      if (cvaConfig) {
        for (const variantName of Object.keys(cvaConfig.variants)) {
          // Check if prop already exists
          if (!props.find(p => p.name === variantName)) {
            const variantValues = Object.keys(cvaConfig.variants[variantName]);
            props.push({
              name: variantName,
              type: variantValues.map(v => `"${v}"`).join(' | '),
              optional: true,
              isVariant: true,
              defaultValue: cvaConfig.defaultVariants[variantName],
              allowedValues: variantValues,
            });
          }
        }
      }
    }
  }
}

/**
 * Extracts props from a type alias declaration.
 */
function extractPropsFromTypeAlias(
  alias: TypeAliasDeclaration,
  props: PropDefinition[],
  cvaConfig?: CvaConfig
): void {
  // For intersection types like: type Props = BaseProps & CustomProps
  const typeNode = alias.getTypeNode();
  if (!typeNode) return;

  // Handle intersection types
  if (typeNode.getKind() === SyntaxKind.IntersectionType) {
    const intersectionType = typeNode.asKind(SyntaxKind.IntersectionType);
    if (intersectionType) {
      for (const subType of intersectionType.getTypeNodes()) {
        // Check for VariantProps
        if (subType.getText().includes('VariantProps') && cvaConfig) {
          for (const variantName of Object.keys(cvaConfig.variants)) {
            if (!props.find(p => p.name === variantName)) {
              const variantValues = Object.keys(cvaConfig.variants[variantName]);
              props.push({
                name: variantName,
                type: variantValues.map(v => `"${v}"`).join(' | '),
                optional: true,
                isVariant: true,
                defaultValue: cvaConfig.defaultVariants[variantName],
                allowedValues: variantValues,
              });
            }
          }
        }

        // Handle type literals
        if (subType.getKind() === SyntaxKind.TypeLiteral) {
          const typeLiteral = subType.asKind(SyntaxKind.TypeLiteral);
          if (typeLiteral) {
            for (const member of typeLiteral.getMembers()) {
              if (member.getKind() === SyntaxKind.PropertySignature) {
                const propDef = extractPropertyDefinition(member as PropertySignature, cvaConfig);
                if (propDef) {
                  props.push(propDef);
                }
              }
            }
          }
        }
      }
    }
  }

  // Handle type literals directly
  if (typeNode.getKind() === SyntaxKind.TypeLiteral) {
    const typeLiteral = typeNode.asKind(SyntaxKind.TypeLiteral);
    if (typeLiteral) {
      for (const member of typeLiteral.getMembers()) {
        if (member.getKind() === SyntaxKind.PropertySignature) {
          const propDef = extractPropertyDefinition(member as PropertySignature, cvaConfig);
          if (propDef) {
            props.push(propDef);
          }
        }
      }
    }
  }
}

/**
 * Extracts a single property definition from a property signature.
 */
function extractPropertyDefinition(
  prop: PropertySignature,
  cvaConfig?: CvaConfig
): PropDefinition | undefined {
  const name = prop.getName();
  const typeNode = prop.getTypeNode();
  const type = typeNode?.getText() || 'unknown';
  const optional = prop.hasQuestionToken();

  // Check if this is a variant prop
  const isVariant = cvaConfig ? Object.keys(cvaConfig.variants).includes(name) : false;

  // Get JSDoc description
  const jsDocs = prop.getJsDocs();
  const description = jsDocs.length > 0 ? jsDocs[0].getDescription() : undefined;

  // Get default value if specified in JSDoc
  let defaultValue: unknown = undefined;
  if (isVariant && cvaConfig) {
    defaultValue = cvaConfig.defaultVariants[name];
  }

  return {
    name,
    type,
    optional,
    isVariant,
    defaultValue,
    allowedValues: isVariant && cvaConfig ? Object.keys(cvaConfig.variants[name]) : undefined,
    description: description?.trim(),
  };
}

/**
 * Gets the props interface/type name from the source file.
 */
export function getPropsTypeName(sourceFile: SourceFile): string | undefined {
  const propsInterface = sourceFile.getInterfaces()
    .find(iface => iface.getName().endsWith('Props'));

  if (propsInterface) {
    return propsInterface.getName();
  }

  const propsType = sourceFile.getTypeAliases()
    .find(alias => alias.getName().endsWith('Props'));

  return propsType?.getName();
}

/**
 * Analyzes props for a specific named component in the source file.
 * Extracts destructured props from forwardRef callbacks or function parameters.
 * Also extracts props from Radix primitive type references.
 */
export function analyzePropsForComponent(
  sourceFile: SourceFile,
  componentName: string,
  cvaConfig?: CvaConfig
): PropDefinition[] {
  const props: PropDefinition[] = [];
  let radixPrimitiveInfo: RadixPrimitiveInfo | undefined;

  // First, check for a component-specific props interface (e.g., ButtonProps for Button)
  const componentPropsInterface = sourceFile.getInterfaces()
    .find(iface => iface.getName() === `${componentName}Props`);

  if (componentPropsInterface) {
    extractPropsFromInterface(componentPropsInterface, props, cvaConfig);
    return props;
  }

  // Check for a component-specific type alias
  const componentPropsType = sourceFile.getTypeAliases()
    .find(alias => alias.getName() === `${componentName}Props`);

  if (componentPropsType) {
    extractPropsFromTypeAlias(componentPropsType, props, cvaConfig);
    return props;
  }

  // Find the component declaration and extract destructured props
  const variableStatements = sourceFile.getVariableStatements();
  for (const statement of variableStatements) {
    for (const declaration of statement.getDeclarations()) {
      if (declaration.getName() === componentName) {
        const initializer = declaration.getInitializer();
        if (initializer) {
          const initText = initializer.getText();

          // Handle forwardRef: extract props from the callback's first parameter
          if (initText.includes('forwardRef') || initText.includes('React.forwardRef')) {
            extractDestructuredPropsFromForwardRef(initText, props, cvaConfig);

            // Also extract Radix primitive info from type annotations
            radixPrimitiveInfo = extractRadixPrimitiveFromForwardRef(initText, sourceFile);
          }
          // Handle arrow functions: ({ prop1, prop2 }) => ...
          else if (initText.includes('=>')) {
            extractDestructuredPropsFromArrowFunction(initText, props, cvaConfig);
          }
        }
      }
    }
  }

  // Check function declarations
  const functionDeclarations = sourceFile.getFunctions();
  for (const func of functionDeclarations) {
    if (func.getName() === componentName) {
      const params = func.getParameters();
      if (params.length > 0) {
        const firstParam = params[0];
        extractDestructuredPropsFromParameter(firstParam.getText(), props, cvaConfig);
      }
    }
  }

  // If we found a Radix primitive reference, add its props
  if (radixPrimitiveInfo) {
    addRadixPrimitiveProps(radixPrimitiveInfo, props);
  }

  // If still no props found, fall back to file-level props analysis
  if (props.length === 0) {
    return analyzeProps(sourceFile, cvaConfig);
  }

  return props;
}

/**
 * Extracts Radix primitive information from a forwardRef type annotation.
 * Pattern: React.forwardRef<React.ElementRef<typeof X.Y>, React.ComponentPropsWithoutRef<typeof X.Y>>
 */
function extractRadixPrimitiveFromForwardRef(code: string, sourceFile: SourceFile): RadixPrimitiveInfo | undefined {
  // Match ComponentPropsWithoutRef<typeof X.Y> pattern
  const propsMatch = code.match(/ComponentPropsWithoutRef\s*<\s*typeof\s+(\w+)(?:Primitives?)?\.(\w+)/);
  if (propsMatch) {
    const importAlias = propsMatch[1]; // e.g., "SwitchPrimitives" or "Switch"
    const componentName = propsMatch[2]; // e.g., "Root"

    // Find the corresponding import to get the package name
    const packageName = findRadixPackageForImport(sourceFile, importAlias);
    if (packageName) {
      return { packageName, componentName };
    }
  }
  return undefined;
}

/**
 * Finds the Radix package name for a given import alias.
 */
function findRadixPackageForImport(sourceFile: SourceFile, importAlias: string): string | undefined {
  const importDeclarations = sourceFile.getImportDeclarations();

  for (const imp of importDeclarations) {
    const moduleSpecifier = imp.getModuleSpecifierValue();

    // Check if it's a Radix package
    if (moduleSpecifier.startsWith('@radix-ui/react-')) {
      // Check namespace import: import * as SwitchPrimitives from "@radix-ui/react-switch"
      const namespaceImport = imp.getNamespaceImport();
      if (namespaceImport && namespaceImport.getText().includes(importAlias)) {
        return moduleSpecifier;
      }

      // Check if the alias matches the package (e.g., SwitchPrimitives -> @radix-ui/react-switch)
      const packageShortName = moduleSpecifier.replace('@radix-ui/react-', '');
      const normalizedAlias = importAlias.replace(/Primitives?$/, '').toLowerCase();
      if (packageShortName === normalizedAlias) {
        return moduleSpecifier;
      }
    }
  }

  return undefined;
}

/**
 * Adds props from a Radix primitive to the props array.
 */
function addRadixPrimitiveProps(info: RadixPrimitiveInfo, props: PropDefinition[]): void {
  const radixProps = getRadixPrimitiveProps(info.packageName, info.componentName);
  if (!radixProps) return;

  for (const radixProp of radixProps) {
    // Skip if prop already exists (explicitly destructured props take precedence)
    if (props.find(p => p.name === radixProp.name)) {
      continue;
    }

    // Skip internal props like asChild
    if (radixProp.name === 'asChild') {
      continue;
    }

    props.push({
      name: radixProp.name,
      type: radixProp.type,
      optional: radixProp.optional,
      isVariant: false,
      defaultValue: radixProp.defaultValue,
      description: radixProp.description,
      // Store state prop info as metadata for compilers
      ...(radixProp.isStateProp && radixProp.dataStateValues ? {
        isStateProp: true,
        dataStateValues: radixProp.dataStateValues,
      } : {}),
    });
  }
}

/**
 * Extracts destructured props from a forwardRef callback.
 * Pattern: forwardRef<T, P>(({ prop1, prop2, ...rest }, ref) => ...)
 */
function extractDestructuredPropsFromForwardRef(
  code: string,
  props: PropDefinition[],
  cvaConfig?: CvaConfig
): void {
  // Match the destructured props object in forwardRef callback
  // Pattern: (({ destructured }, ref) => or ((props, ref) =>
  const match = code.match(/\(\s*\(\s*\{([^}]+)\}/);
  if (match) {
    parseDestructuredProps(match[1], props, cvaConfig);
  }
}

/**
 * Extracts destructured props from an arrow function.
 * Pattern: ({ prop1, prop2 }) => ... or (props) => ...
 */
function extractDestructuredPropsFromArrowFunction(
  code: string,
  props: PropDefinition[],
  cvaConfig?: CvaConfig
): void {
  // Match destructured props at the start of an arrow function
  const match = code.match(/^\s*\(\s*\{([^}]+)\}/);
  if (match) {
    parseDestructuredProps(match[1], props, cvaConfig);
  }
}

/**
 * Extracts destructured props from a function parameter.
 */
function extractDestructuredPropsFromParameter(
  paramText: string,
  props: PropDefinition[],
  cvaConfig?: CvaConfig
): void {
  // Match destructured object pattern
  const match = paramText.match(/\{([^}]+)\}/);
  if (match) {
    parseDestructuredProps(match[1], props, cvaConfig);
  }
}

/**
 * Parses a destructured props string into PropDefinition array.
 * Handles: { className, variant, size, ...props }
 */
function parseDestructuredProps(
  destructuredStr: string,
  props: PropDefinition[],
  cvaConfig?: CvaConfig
): void {
  // Split by comma, handling potential default values
  const parts = destructuredStr.split(',').map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    // Skip rest spread (...props, ...rest)
    if (part.startsWith('...')) {
      continue;
    }

    // Handle renamed props: originalName: newName
    // Handle default values: propName = defaultValue
    let propName = part;
    let defaultValue: string | undefined;

    // Check for default value assignment
    const defaultMatch = part.match(/^(\w+)\s*=\s*(.+)$/);
    if (defaultMatch) {
      propName = defaultMatch[1];
      defaultValue = defaultMatch[2].trim();
    }

    // Check for renaming (className: customClassName)
    const renameMatch = propName.match(/^(\w+)\s*:\s*(\w+)$/);
    if (renameMatch) {
      propName = renameMatch[1];
    }

    // Clean up the prop name
    propName = propName.trim();
    if (!propName || propName === 'children') {
      continue;
    }

    // Check if this is a variant prop from CVA
    const isVariant = cvaConfig ? Object.keys(cvaConfig.variants).includes(propName) : false;

    // Determine type based on context
    let type = 'unknown';
    if (propName === 'className' || propName === 'class') {
      type = 'string';
    } else if (isVariant && cvaConfig) {
      const variantValues = Object.keys(cvaConfig.variants[propName]);
      type = variantValues.map(v => `"${v}"`).join(' | ');
    }

    props.push({
      name: propName,
      type,
      optional: true, // Destructured props are typically optional
      isVariant,
      defaultValue: defaultValue || (isVariant && cvaConfig ? cvaConfig.defaultVariants[propName] : undefined),
      allowedValues: isVariant && cvaConfig ? Object.keys(cvaConfig.variants[propName]) : undefined,
    });
  }
}
