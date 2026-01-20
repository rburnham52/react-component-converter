import { SourceFile, SyntaxKind, InterfaceDeclaration, TypeAliasDeclaration, PropertySignature } from 'ts-morph';
import type { PropDefinition, CvaConfig } from '@component-converter/core';

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
