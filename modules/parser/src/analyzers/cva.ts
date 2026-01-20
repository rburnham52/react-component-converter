import { Project, SourceFile, CallExpression, ObjectLiteralExpression, SyntaxKind } from 'ts-morph';
import type { CvaConfig } from '@react-component-converter/core';

/**
 * Analyzes a source file to extract CVA (Class Variance Authority) configurations.
 *
 * CVA pattern example:
 * ```ts
 * const buttonVariants = cva("base-classes", {
 *   variants: {
 *     variant: { default: "...", destructive: "..." },
 *     size: { default: "...", sm: "...", lg: "..." }
 *   },
 *   defaultVariants: { variant: "default", size: "default" }
 * })
 * ```
 */
export function analyzeCva(sourceFile: SourceFile): CvaConfig | undefined {
  // Find all cva() calls
  const cvaCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(call => {
      const expression = call.getExpression();
      return expression.getText() === 'cva';
    });

  if (cvaCalls.length === 0) {
    return undefined;
  }

  // Get the first cva call (typically components have one)
  const cvaCall = cvaCalls[0];

  // Find the variable declaration to get the name (e.g., "buttonVariants")
  const variableDeclaration = cvaCall.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
  const name = variableDeclaration?.getName() || 'variants';

  const args = cvaCall.getArguments();
  if (args.length < 1) {
    return undefined;
  }

  // First argument: base classes (string or template literal)
  const baseClassesArg = args[0];
  let baseClasses = '';

  if (baseClassesArg.getKind() === SyntaxKind.StringLiteral) {
    baseClasses = baseClassesArg.getText().slice(1, -1); // Remove quotes
  } else if (baseClassesArg.getKind() === SyntaxKind.TemplateExpression ||
             baseClassesArg.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
    baseClasses = baseClassesArg.getText().slice(1, -1); // Remove backticks
  } else {
    baseClasses = baseClassesArg.getText();
  }

  // Second argument: config object with variants and defaultVariants
  const variants: Record<string, Record<string, string>> = {};
  const defaultVariants: Record<string, string> = {};
  const compoundVariants: Array<{ conditions: Record<string, string>; classes: string }> = [];

  if (args.length >= 2 && args[1].getKind() === SyntaxKind.ObjectLiteralExpression) {
    const configObj = args[1] as ObjectLiteralExpression;

    // Extract variants
    const variantsProperty = configObj.getProperty('variants');
    if (variantsProperty && variantsProperty.getKind() === SyntaxKind.PropertyAssignment) {
      const variantsObj = variantsProperty.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);
      if (variantsObj) {
        for (const prop of variantsObj.getProperties()) {
          if (prop.getKind() === SyntaxKind.PropertyAssignment) {
            const variantName = prop.getFirstChildByKind(SyntaxKind.Identifier)?.getText() || '';
            const variantValues: Record<string, string> = {};

            const valuesObj = prop.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);
            if (valuesObj) {
              for (const valueProp of valuesObj.getProperties()) {
                if (valueProp.getKind() === SyntaxKind.PropertyAssignment) {
                  const valueName = valueProp.getFirstChildByKind(SyntaxKind.Identifier)?.getText() ||
                                   valueProp.getFirstChildByKind(SyntaxKind.StringLiteral)?.getText().slice(1, -1) || '';
                  const valueClasses = valueProp.getLastChild()?.getText() || '';
                  // Remove quotes if present
                  variantValues[valueName] = valueClasses.startsWith('"') || valueClasses.startsWith("'")
                    ? valueClasses.slice(1, -1)
                    : valueClasses;
                }
              }
            }

            if (variantName && Object.keys(variantValues).length > 0) {
              variants[variantName] = variantValues;
            }
          }
        }
      }
    }

    // Extract defaultVariants
    const defaultVariantsProperty = configObj.getProperty('defaultVariants');
    if (defaultVariantsProperty && defaultVariantsProperty.getKind() === SyntaxKind.PropertyAssignment) {
      const defaultsObj = defaultVariantsProperty.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);
      if (defaultsObj) {
        for (const prop of defaultsObj.getProperties()) {
          if (prop.getKind() === SyntaxKind.PropertyAssignment) {
            const propName = prop.getFirstChildByKind(SyntaxKind.Identifier)?.getText() || '';
            const propValue = prop.getLastChild()?.getText() || '';
            // Remove quotes if present
            defaultVariants[propName] = propValue.startsWith('"') || propValue.startsWith("'")
              ? propValue.slice(1, -1)
              : propValue;
          }
        }
      }
    }

    // Extract compoundVariants (optional)
    const compoundVariantsProperty = configObj.getProperty('compoundVariants');
    if (compoundVariantsProperty && compoundVariantsProperty.getKind() === SyntaxKind.PropertyAssignment) {
      const compoundArray = compoundVariantsProperty.getFirstChildByKind(SyntaxKind.ArrayLiteralExpression);
      if (compoundArray) {
        for (const element of compoundArray.getElements()) {
          if (element.getKind() === SyntaxKind.ObjectLiteralExpression) {
            const compoundObj = element as ObjectLiteralExpression;
            const conditions: Record<string, string> = {};
            let classes = '';

            for (const prop of compoundObj.getProperties()) {
              if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                const propName = prop.getFirstChildByKind(SyntaxKind.Identifier)?.getText() || '';
                const propValue = prop.getLastChild()?.getText() || '';
                const cleanValue = propValue.startsWith('"') || propValue.startsWith("'")
                  ? propValue.slice(1, -1)
                  : propValue;

                if (propName === 'class' || propName === 'className') {
                  classes = cleanValue;
                } else {
                  conditions[propName] = cleanValue;
                }
              }
            }

            if (Object.keys(conditions).length > 0 && classes) {
              compoundVariants.push({ conditions, classes });
            }
          }
        }
      }
    }
  }

  return {
    name,
    baseClasses,
    variants,
    defaultVariants,
    compoundVariants: compoundVariants.length > 0 ? compoundVariants : undefined,
  };
}

/**
 * Analyzes a source file to extract ALL CVA configurations (for files with multiple CVAs).
 * Returns a map of CVA name to CvaConfig.
 */
export function analyzeAllCvaDefinitions(sourceFile: SourceFile): Record<string, CvaConfig> {
  const configs: Record<string, CvaConfig> = {};

  // Find all cva() calls
  const cvaCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(call => {
      const expression = call.getExpression();
      return expression.getText() === 'cva';
    });

  for (const cvaCall of cvaCalls) {
    // Find the variable declaration to get the name
    const variableDeclaration = cvaCall.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
    const name = variableDeclaration?.getName() || `variants_${Object.keys(configs).length}`;

    const args = cvaCall.getArguments();
    if (args.length < 1) continue;

    // First argument: base classes
    const baseClassesArg = args[0];
    let baseClasses = '';

    if (baseClassesArg.getKind() === SyntaxKind.StringLiteral) {
      baseClasses = baseClassesArg.getText().slice(1, -1);
    } else if (baseClassesArg.getKind() === SyntaxKind.TemplateExpression ||
               baseClassesArg.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
      baseClasses = baseClassesArg.getText().slice(1, -1);
    } else {
      baseClasses = baseClassesArg.getText();
    }

    // Second argument: config object
    const variants: Record<string, Record<string, string>> = {};
    const defaultVariants: Record<string, string> = {};

    if (args.length >= 2 && args[1].getKind() === SyntaxKind.ObjectLiteralExpression) {
      const configObj = args[1] as ObjectLiteralExpression;

      // Extract variants
      const variantsProperty = configObj.getProperty('variants');
      if (variantsProperty && variantsProperty.getKind() === SyntaxKind.PropertyAssignment) {
        const variantsObj = variantsProperty.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);
        if (variantsObj) {
          for (const prop of variantsObj.getProperties()) {
            if (prop.getKind() === SyntaxKind.PropertyAssignment) {
              const variantName = prop.getFirstChildByKind(SyntaxKind.Identifier)?.getText() || '';
              const variantValues: Record<string, string> = {};

              const valuesObj = prop.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);
              if (valuesObj) {
                for (const valueProp of valuesObj.getProperties()) {
                  if (valueProp.getKind() === SyntaxKind.PropertyAssignment) {
                    const valueName = valueProp.getFirstChildByKind(SyntaxKind.Identifier)?.getText() ||
                                     valueProp.getFirstChildByKind(SyntaxKind.StringLiteral)?.getText().slice(1, -1) || '';
                    const valueClasses = valueProp.getLastChild()?.getText() || '';
                    variantValues[valueName] = valueClasses.startsWith('"') || valueClasses.startsWith("'")
                      ? valueClasses.slice(1, -1)
                      : valueClasses;
                  }
                }
              }

              if (variantName && Object.keys(variantValues).length > 0) {
                variants[variantName] = variantValues;
              }
            }
          }
        }
      }

      // Extract defaultVariants
      const defaultVariantsProperty = configObj.getProperty('defaultVariants');
      if (defaultVariantsProperty && defaultVariantsProperty.getKind() === SyntaxKind.PropertyAssignment) {
        const defaultsObj = defaultVariantsProperty.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);
        if (defaultsObj) {
          for (const prop of defaultsObj.getProperties()) {
            if (prop.getKind() === SyntaxKind.PropertyAssignment) {
              const propName = prop.getFirstChildByKind(SyntaxKind.Identifier)?.getText() || '';
              const propValue = prop.getLastChild()?.getText() || '';
              defaultVariants[propName] = propValue.startsWith('"') || propValue.startsWith("'")
                ? propValue.slice(1, -1)
                : propValue;
            }
          }
        }
      }
    }

    configs[name] = {
      name,
      baseClasses,
      variants,
      defaultVariants,
    };
  }

  return configs;
}

/**
 * Extracts the raw CVA call expression as a string for preservation.
 */
export function extractCvaSource(sourceFile: SourceFile): string | undefined {
  const cvaCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(call => call.getExpression().getText() === 'cva');

  if (cvaCalls.length === 0) {
    return undefined;
  }

  // Get the full variable declaration including the cva call
  const variableDeclaration = cvaCalls[0].getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
  if (variableDeclaration) {
    const variableStatement = variableDeclaration.getFirstAncestorByKind(SyntaxKind.VariableStatement);
    return variableStatement?.getText();
  }

  return cvaCalls[0].getText();
}
