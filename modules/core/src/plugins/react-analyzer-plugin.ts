import type { MitosisComponent } from '@builder.io/mitosis';
import type { ConverterPlugin, PluginContext } from '../types/plugins.js';
import type {
  CvaConfig,
  ForwardRefConfig,
  OriginalImport,
  PropDefinition,
  ReactComponentMeta,
} from '../types/component-meta.js';

/**
 * Metadata extracted by the React analyzer plugin
 */
export interface ReactAnalyzerMetadata {
  /** All CVA configurations found in the file */
  cvaConfigs: Record<string, CvaConfig>;
  /** forwardRef configuration for primary component */
  forwardRef?: ForwardRefConfig;
  /** Whether the component uses cn() utility */
  usesCn: boolean;
  /** Categorized imports from the source file */
  imports: OriginalImport[];
  /** Extracted props definitions */
  props: PropDefinition[];
  /** Component names found in the file */
  componentNames: string[];
}

/**
 * Options for the React analyzer plugin
 */
export interface ReactAnalyzerPluginOptions {
  /** Custom cn() import path to detect */
  cnImportPath?: string;
}

/**
 * Creates a React analyzer plugin that uses ts-morph to extract metadata
 * from React components before Mitosis parsing.
 *
 * This plugin extracts:
 * - CVA (Class Variance Authority) configurations
 * - forwardRef patterns and element types
 * - cn() utility usage
 * - Import categorization (React, Radix, utilities, etc.)
 * - Props definitions including variant props
 *
 * The extracted metadata is stored in context.metadata.reactAnalyzer
 * for use by subsequent plugins (like shadcn-plugin).
 */
export function createReactAnalyzerPlugin(
  options: ReactAnalyzerPluginOptions = {}
): ConverterPlugin {
  return {
    name: 'react-analyzer',
    order: 5, // Run very early, before other plugins

    preParse: async (code: string, context: PluginContext): Promise<string> => {
      // Dynamically import ts-morph and analyzers from parser package
      const { Project, SyntaxKind } = await import('ts-morph');

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

      // Extract all CVA definitions
      const cvaConfigs = analyzeAllCvaDefinitions(sourceFile, SyntaxKind);

      // Extract forwardRef configuration
      const forwardRef = analyzeForwardRef(sourceFile, SyntaxKind);

      // Check cn() usage
      const usesCn = checkUsesCn(sourceFile, SyntaxKind, options.cnImportPath);

      // Extract and categorize imports
      const imports = analyzeImports(sourceFile);

      // Find component names
      const componentNames = findComponentNames(sourceFile, SyntaxKind);

      // Extract props for primary component
      const primaryCvaName = Object.keys(cvaConfigs)[0];
      const primaryCva = primaryCvaName ? cvaConfigs[primaryCvaName] : undefined;
      const props = analyzeProps(sourceFile, SyntaxKind, primaryCva);

      // Store metadata in context
      const metadata: ReactAnalyzerMetadata = {
        cvaConfigs,
        forwardRef,
        usesCn,
        imports,
        props,
        componentNames,
      };

      context.metadata.reactAnalyzer = metadata;

      // Transform code for Mitosis compatibility
      // Use targetComponent from context if specified, otherwise use first component found
      const primaryComponentName = context.targetComponent || componentNames[0] || 'Component';
      let transformedCode = transformForMitosis(
        code,
        primaryComponentName,
        sourceFile,
        SyntaxKind
      );

      return transformedCode;
    },

    postParse: async (
      component: MitosisComponent,
      context: PluginContext
    ): Promise<MitosisComponent> => {
      // Attach metadata to component.meta for use by generators
      const analyzerMeta = context.metadata.reactAnalyzer as ReactAnalyzerMetadata | undefined;

      if (analyzerMeta) {
        // Build ReactComponentMeta from analyzer data
        const primaryCvaName = Object.keys(analyzerMeta.cvaConfigs)[0];
        const reactMeta: ReactComponentMeta = {
          cva: primaryCvaName ? analyzerMeta.cvaConfigs[primaryCvaName] : undefined,
          forwardRef: analyzerMeta.forwardRef,
          usesCn: analyzerMeta.usesCn,
          originalImports: analyzerMeta.imports,
        };

        (component.meta as Record<string, unknown>).reactMeta = reactMeta;
      }

      return component;
    },
  };
}

// ============================================================================
// Analysis Functions (using ts-morph)
// ============================================================================

/**
 * Analyzes all CVA definitions in the source file
 */
function analyzeAllCvaDefinitions(
  sourceFile: any,
  SyntaxKind: any
): Record<string, CvaConfig> {
  const configs: Record<string, CvaConfig> = {};

  const cvaCalls = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((call: any) => call.getExpression().getText() === 'cva');

  for (const cvaCall of cvaCalls) {
    const variableDeclaration = cvaCall.getFirstAncestorByKind(
      SyntaxKind.VariableDeclaration
    );
    const name =
      variableDeclaration?.getName() || `variants_${Object.keys(configs).length}`;

    const args = cvaCall.getArguments();
    if (args.length < 1) continue;

    // First argument: base classes
    const baseClassesArg = args[0];
    let baseClasses = '';

    if (baseClassesArg.getKind() === SyntaxKind.StringLiteral) {
      baseClasses = baseClassesArg.getText().slice(1, -1);
    } else if (
      baseClassesArg.getKind() === SyntaxKind.TemplateExpression ||
      baseClassesArg.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral
    ) {
      baseClasses = baseClassesArg.getText().slice(1, -1);
    } else {
      baseClasses = baseClassesArg.getText();
    }

    // Second argument: config object
    const variants: Record<string, Record<string, string>> = {};
    const defaultVariants: Record<string, string> = {};
    const compoundVariants: Array<{ conditions: Record<string, string>; classes: string }> = [];

    if (args.length >= 2 && args[1].getKind() === SyntaxKind.ObjectLiteralExpression) {
      const configObj = args[1];

      // Extract variants
      const variantsProperty = configObj.getProperty('variants');
      if (variantsProperty?.getKind() === SyntaxKind.PropertyAssignment) {
        const variantsObj = variantsProperty.getFirstChildByKind(
          SyntaxKind.ObjectLiteralExpression
        );
        if (variantsObj) {
          for (const prop of variantsObj.getProperties()) {
            if (prop.getKind() === SyntaxKind.PropertyAssignment) {
              const variantName =
                prop.getFirstChildByKind(SyntaxKind.Identifier)?.getText() || '';
              const variantValues: Record<string, string> = {};

              const valuesObj = prop.getFirstChildByKind(
                SyntaxKind.ObjectLiteralExpression
              );
              if (valuesObj) {
                for (const valueProp of valuesObj.getProperties()) {
                  if (valueProp.getKind() === SyntaxKind.PropertyAssignment) {
                    const valueName =
                      valueProp.getFirstChildByKind(SyntaxKind.Identifier)?.getText() ||
                      valueProp
                        .getFirstChildByKind(SyntaxKind.StringLiteral)
                        ?.getText()
                        .slice(1, -1) ||
                      '';
                    const valueClasses = valueProp.getLastChild()?.getText() || '';
                    variantValues[valueName] =
                      valueClasses.startsWith('"') || valueClasses.startsWith("'")
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
      if (defaultVariantsProperty?.getKind() === SyntaxKind.PropertyAssignment) {
        const defaultsObj = defaultVariantsProperty.getFirstChildByKind(
          SyntaxKind.ObjectLiteralExpression
        );
        if (defaultsObj) {
          for (const prop of defaultsObj.getProperties()) {
            if (prop.getKind() === SyntaxKind.PropertyAssignment) {
              const propName =
                prop.getFirstChildByKind(SyntaxKind.Identifier)?.getText() || '';
              const propValue = prop.getLastChild()?.getText() || '';
              defaultVariants[propName] =
                propValue.startsWith('"') || propValue.startsWith("'")
                  ? propValue.slice(1, -1)
                  : propValue;
            }
          }
        }
      }

      // Extract compoundVariants
      const compoundVariantsProperty = configObj.getProperty('compoundVariants');
      if (compoundVariantsProperty?.getKind() === SyntaxKind.PropertyAssignment) {
        const compoundArray = compoundVariantsProperty.getFirstChildByKind(
          SyntaxKind.ArrayLiteralExpression
        );
        if (compoundArray) {
          for (const element of compoundArray.getElements()) {
            if (element.getKind() === SyntaxKind.ObjectLiteralExpression) {
              const conditions: Record<string, string> = {};
              let classes = '';

              for (const prop of element.getProperties()) {
                if (prop.getKind() === SyntaxKind.PropertyAssignment) {
                  const propName =
                    prop.getFirstChildByKind(SyntaxKind.Identifier)?.getText() || '';
                  const propValue = prop.getLastChild()?.getText() || '';
                  const cleanValue =
                    propValue.startsWith('"') || propValue.startsWith("'")
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

    configs[name] = {
      name,
      baseClasses,
      variants,
      defaultVariants,
      compoundVariants: compoundVariants.length > 0 ? compoundVariants : undefined,
    };
  }

  return configs;
}

/**
 * Analyzes forwardRef usage
 */
function analyzeForwardRef(
  sourceFile: any,
  SyntaxKind: any
): ForwardRefConfig | undefined {
  const forwardRefCalls = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((call: any) => {
      const text = call.getExpression().getText();
      return (
        text === 'forwardRef' ||
        text === 'React.forwardRef' ||
        text.endsWith('.forwardRef')
      );
    });

  if (forwardRefCalls.length === 0) {
    return undefined;
  }

  const forwardRefCall = forwardRefCalls[0];
  const typeArguments = forwardRefCall.getTypeArguments();
  let elementType = 'HTMLElement';

  if (typeArguments.length > 0) {
    const rawType = typeArguments[0].getText();
    elementType = normalizeElementType(rawType);
  }

  // Find ref parameter name
  let paramName = 'ref';
  const arrowFunction = forwardRefCall.getFirstDescendantByKind(
    SyntaxKind.ArrowFunction
  );
  if (arrowFunction) {
    const parameters = arrowFunction.getParameters();
    if (parameters.length >= 2) {
      paramName = parameters[1].getName();
    }
  }

  return { elementType, paramName };
}

/**
 * Normalizes React element types to HTML element types
 */
function normalizeElementType(rawType: string): string {
  if (rawType.startsWith('HTML') && rawType.endsWith('Element')) {
    return rawType;
  }

  const radixToHtmlElement: Record<string, string> = {
    Root: 'HTMLDivElement',
    Trigger: 'HTMLButtonElement',
    Content: 'HTMLDivElement',
    Close: 'HTMLButtonElement',
    'LabelPrimitive.Root': 'HTMLLabelElement',
    'SwitchPrimitive.Root': 'HTMLButtonElement',
    'CheckboxPrimitive.Root': 'HTMLButtonElement',
    'ProgressPrimitive.Root': 'HTMLDivElement',
    'SeparatorPrimitive.Root': 'HTMLDivElement',
    'DialogPrimitive.Content': 'HTMLDivElement',
    'DialogPrimitive.Overlay': 'HTMLDivElement',
    'DialogPrimitive.Title': 'HTMLHeadingElement',
    'SelectPrimitive.Trigger': 'HTMLButtonElement',
    'SelectPrimitive.Content': 'HTMLDivElement',
    'TabsPrimitive.Root': 'HTMLDivElement',
    'TabsPrimitive.Trigger': 'HTMLButtonElement',
    'AccordionPrimitive.Trigger': 'HTMLButtonElement',
    'AccordionPrimitive.Content': 'HTMLDivElement',
  };

  const normalizedType = rawType.replace(/\s+/g, ' ').trim();

  // Handle React.ElementRef<typeof X>
  const elementRefMatch = normalizedType.match(
    /(?:React\.)?ElementRef\s*<\s*typeof\s+([^>]+)\s*>/
  );
  if (elementRefMatch) {
    const primitiveRef = elementRefMatch[1].trim();

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

  return rawType;
}

/**
 * Checks if cn() utility is used
 */
function checkUsesCn(
  sourceFile: any,
  SyntaxKind: any,
  customPath?: string
): boolean {
  // Check imports for cn
  const importDecls = sourceFile.getImportDeclarations();
  let hasCnImport = false;

  for (const decl of importDecls) {
    const source = decl.getModuleSpecifierValue();
    const namedImports = decl.getNamedImports().map((n: any) => n.getName());

    if (
      namedImports.includes('cn') ||
      (customPath && source === customPath) ||
      source.includes('/utils')
    ) {
      hasCnImport = true;
      break;
    }
  }

  if (!hasCnImport) {
    return false;
  }

  // Check for actual cn() calls
  const cnCalls = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((call: any) => call.getExpression().getText() === 'cn');

  return cnCalls.length > 0;
}

/**
 * Analyzes imports and categorizes them
 */
function analyzeImports(sourceFile: any): OriginalImport[] {
  const imports: OriginalImport[] = [];

  for (const importDecl of sourceFile.getImportDeclarations()) {
    const source = importDecl.getModuleSpecifierValue();
    const namedImports: string[] = [];
    let defaultImport: string | undefined;

    const defaultImportNode = importDecl.getDefaultImport();
    if (defaultImportNode) {
      defaultImport = defaultImportNode.getText();
    }

    for (const named of importDecl.getNamedImports()) {
      namedImports.push(named.getName());
    }

    const namespaceImport = importDecl.getNamespaceImport();
    if (namespaceImport) {
      defaultImport = `* as ${namespaceImport.getText()}`;
    }

    const category = categorizeImport(source, namedImports);

    imports.push({
      source,
      namedImports: namedImports.length > 0 ? namedImports : undefined,
      defaultImport,
      category,
    });
  }

  return imports;
}

/**
 * Categorizes an import by source
 */
function categorizeImport(
  source: string,
  namedImports: string[]
): OriginalImport['category'] {
  if (source === 'react' || source.startsWith('react/') || source.startsWith('react-dom')) {
    return 'react';
  }
  if (source.startsWith('@radix-ui/')) {
    return 'radix';
  }
  if (source.includes('lucide') || source.includes('icon')) {
    return 'icon';
  }
  if (
    source.includes('/utils') ||
    source === 'clsx' ||
    source === 'tailwind-merge' ||
    source === 'class-variance-authority' ||
    namedImports.includes('cn') ||
    namedImports.includes('cva')
  ) {
    return 'utility';
  }
  if (source.endsWith('.css') || source.endsWith('.scss')) {
    return 'style';
  }
  return 'other';
}

/**
 * Finds component names in the file
 */
function findComponentNames(sourceFile: any, SyntaxKind: any): string[] {
  const names: string[] = [];

  // Variable declarations with forwardRef or arrow functions returning JSX
  const variableStatements = sourceFile.getVariableStatements();
  for (const statement of variableStatements) {
    for (const declaration of statement.getDeclarations()) {
      const name = declaration.getName();
      const init = declaration.getInitializer();
      if (!init) continue;

      const initText = init.getText();
      if (
        initText.includes('forwardRef') ||
        initText.includes('React.forwardRef') ||
        (initText.includes('=>') && (initText.includes('<') || initText.includes('return')))
      ) {
        // Check if first letter is uppercase (component naming convention)
        if (name[0] === name[0].toUpperCase()) {
          names.push(name);
        }
      }
    }
  }

  // Function declarations
  for (const func of sourceFile.getFunctions()) {
    const name = func.getName();
    if (name && name[0] === name[0].toUpperCase()) {
      names.push(name);
    }
  }

  return names;
}

/**
 * Analyzes props from the component
 */
function analyzeProps(
  sourceFile: any,
  SyntaxKind: any,
  cva?: CvaConfig
): PropDefinition[] {
  const props: PropDefinition[] = [];

  // Find interface or type that ends with Props
  const interfaces = sourceFile.getInterfaces();
  const typeAliases = sourceFile.getTypeAliases();

  let propsInterface: any = null;

  for (const iface of interfaces) {
    if (iface.getName().endsWith('Props')) {
      propsInterface = iface;
      break;
    }
  }

  if (!propsInterface) {
    for (const alias of typeAliases) {
      if (alias.getName().endsWith('Props')) {
        // Type aliases are harder to parse, skip for now
        break;
      }
    }
  }

  if (propsInterface) {
    for (const prop of propsInterface.getProperties()) {
      const name = prop.getName();
      const typeNode = prop.getTypeNode();
      const type = typeNode?.getText() || 'unknown';
      const optional = prop.hasQuestionToken();

      // Check if this is a variant prop
      const isVariant = cva ? Object.keys(cva.variants).includes(name) : false;
      const allowedValues = isVariant && cva ? Object.keys(cva.variants[name]) : undefined;

      props.push({
        name,
        type,
        optional,
        isVariant,
        allowedValues,
      });
    }
  }

  return props;
}

/**
 * Transforms React code to be Mitosis-compatible.
 *
 * Mitosis requires a specific format:
 * - export default function ComponentName(props) { return JSX }
 *
 * This function transforms standard React patterns:
 * 1. function Component() {} + export { Component } → export default function Component(props) {}
 * 2. const Component = () => {} → export default function Component(props) {}
 * 3. const Component = forwardRef(...) → export default function Component(props) {}
 */
function transformForMitosis(
  code: string,
  primaryComponentName: string,
  sourceFile: any,
  SyntaxKind: any
): string {
  let result = code;

  // Remove named exports like: export { ComponentName }
  result = result.replace(/export\s*\{[^}]*\}\s*;?\s*/g, '');

  // Check if there's already an export default function
  const hasExportDefaultFunction = /export\s+default\s+function/.test(result);

  if (hasExportDefaultFunction) {
    // Transform destructured props to props parameter for Mitosis
    // export default function X({ a, b }) → export default function X(props)
    result = result.replace(
      /export\s+default\s+function\s+(\w+)\s*\(\s*\{([^}]*)\}\s*(?::\s*[^)]+)?\s*\)/,
      (match, name, destructure) => {
        return `export default function ${name}(props)`;
      }
    );
    return result;
  }

  // Handle: function ComponentName({ props }) { return ... }
  const funcDeclMatch = result.match(
    new RegExp(`function\\s+${primaryComponentName}\\s*\\(\\s*\\{([^}]*)\\}\\s*(?::\\s*[^)]+)?\\s*\\)\\s*\\{([\\s\\S]*?)\\n\\}`, 'm')
  );

  if (funcDeclMatch) {
    const [fullMatch, propsDestructure, body] = funcDeclMatch;

    // Replace the function declaration with export default function Component(props)
    const newFunc = `export default function ${primaryComponentName}(props) {${body}\n}`;
    result = result.replace(fullMatch, newFunc);

    // Clean up any trailing named exports
    result = result.replace(/\n*export\s*\{[^}]*\}\s*;?\s*$/g, '');

    return result;
  }

  // Handle: const ComponentName = ({ props }) => (JSX) or => { return JSX }
  const arrowFuncMatch = result.match(
    new RegExp(`const\\s+${primaryComponentName}\\s*=\\s*\\(\\s*\\{([^}]*)\\}\\s*(?::\\s*[^)]+)?\\s*\\)\\s*=>\\s*([\\s\\S]*?)(?=\\n(?:const|function|export|$))`, 'm')
  );

  if (arrowFuncMatch) {
    const [fullMatch, propsDestructure, body] = arrowFuncMatch;

    let jsxBody = body.trim();
    // Remove trailing semicolon if present
    if (jsxBody.endsWith(';')) {
      jsxBody = jsxBody.slice(0, -1).trim();
    }

    // Wrap in function body if it's just JSX (starts with < or ()
    let funcBody: string;
    if (jsxBody.startsWith('{')) {
      funcBody = jsxBody;
    } else if (jsxBody.startsWith('(')) {
      funcBody = `{\n  return ${jsxBody};\n}`;
    } else {
      funcBody = `{\n  return ${jsxBody};\n}`;
    }

    const newFunc = `export default function ${primaryComponentName}(props) ${funcBody}`;
    result = result.replace(fullMatch, newFunc);

    return result;
  }

  // Handle forwardRef using ts-morph to properly extract the component body
  if (result.includes('forwardRef')) {
    // Find the forwardRef variable declaration using ts-morph
    const forwardRefVarDecl = sourceFile.getVariableDeclaration(primaryComponentName);

    if (forwardRefVarDecl) {
      const initializer = forwardRefVarDecl.getInitializer();
      if (initializer) {
        const initText = initializer.getText();
        if (initText.includes('forwardRef')) {
          // Find the arrow function inside forwardRef
          const arrowFunc = initializer.getFirstDescendantByKind(SyntaxKind.ArrowFunction);
          if (arrowFunc) {
            const arrowBody = arrowFunc.getBody();
            let bodyText = '';

            if (arrowBody) {
              const bodyKind = arrowBody.getKind();
              if (bodyKind === SyntaxKind.Block) {
                // Block body: { return ... }
                bodyText = arrowBody.getText();
              } else {
                // Expression body: () => <JSX/>
                bodyText = `{\n  return ${arrowBody.getText()};\n}`;
              }
            }

            // Get the full statement to replace
            const statement = forwardRefVarDecl.getFirstAncestorByKind(SyntaxKind.VariableStatement);
            if (statement && bodyText) {
              const fullStatement = statement.getText();
              const newFunc = `export default function ${primaryComponentName}(props) ${bodyText}`;
              result = result.replace(fullStatement, newFunc);
            }
          }
        }
      }
    }
  }

  // If we still don't have an export default, and we have a function with the component name,
  // convert it
  if (!/export\s+default/.test(result)) {
    // Try to find any function or const with the primary name
    const anyFuncMatch = result.match(
      new RegExp(`(?:function|const)\\s+${primaryComponentName}\\s*[=(]`)
    );

    if (anyFuncMatch) {
      // Just add export default at the end
      result = result.trim() + `\n\nexport default ${primaryComponentName};\n`;
    }
  }

  // Clean up React imports that Mitosis doesn't need
  result = result.replace(/import\s+\{[^}]*forwardRef[^}]*\}\s+from\s+['"]react['"]\s*;?\n?/g, '');
  result = result.replace(/import\s+React\s+from\s+['"]react['"]\s*;?\n?/g, '');
  result = result.replace(/import\s+\*\s+as\s+React\s+from\s+['"]react['"]\s*;?\n?/g, '');

  // Clean up displayName statements (e.g., Button.displayName = "Button";)
  result = result.replace(/\w+\.displayName\s*=\s*["'][^"']*["']\s*;?\n?/g, '');

  // Remove other component definitions that use forwardRef (for multi-component files)
  // We need to remove variable statements like: const OtherComponent = React.forwardRef<...>(...);
  // Use ts-morph to properly find and remove them
  for (const statement of sourceFile.getVariableStatements()) {
    for (const declaration of statement.getDeclarations()) {
      const name = declaration.getName();
      // Skip the primary component (already transformed) and non-component names
      if (name === primaryComponentName || name[0] !== name[0].toUpperCase()) {
        continue;
      }
      const init = declaration.getInitializer();
      if (init) {
        const initText = init.getText();
        if (initText.includes('forwardRef')) {
          // Remove this statement from the result
          const statementText = statement.getText();
          result = result.replace(statementText, '');
        }
      }
    }
  }

  // Clean up multiple blank lines
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

export default createReactAnalyzerPlugin;
