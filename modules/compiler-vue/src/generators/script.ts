import type { ExtendedMitosisComponent, VueCompilerOptions, PropDefinition, CvaConfig } from '@component-converter/core';

/**
 * Generates the <script setup> block for a Vue 3 component.
 */
export function generateVueScript(
  component: ExtendedMitosisComponent,
  props: PropDefinition[],
  options: VueCompilerOptions = {}
): string {
  const { typescript = true, cnImportPath = '@/lib/utils' } = options;
  const lines: string[] = [];
  const reactMeta = component.meta.reactMeta;
  const baseClasses = (component.meta as any).baseClasses;

  // Check for state props (from Radix primitives)
  const stateProps = props.filter(p => p.isStateProp && p.dataStateValues);

  // Imports
  lines.push(generateImports(component, reactMeta, cnImportPath, props, baseClasses, stateProps));

  // CVA definition (if present)
  if (reactMeta?.cva) {
    lines.push('');
    lines.push(generateCvaDefinition(reactMeta.cva));
  }

  // Props interface (for TypeScript)
  if (typescript) {
    lines.push('');
    lines.push(generatePropsInterface(props, reactMeta, baseClasses));
  }

  // defineProps and withDefaults
  lines.push('');
  lines.push(generatePropsDefinition(props, reactMeta, typescript));

  // Emit definitions for state change callbacks
  const emitDefs = generateEmitDefinitions(props);
  if (emitDefs) {
    lines.push('');
    lines.push(emitDefs);
  }

  // Computed data-state values for state props
  if (stateProps.length > 0) {
    lines.push('');
    lines.push(generateDataStateComputed(stateProps));
  }

  // Ref handling for forwardRef equivalent
  if (reactMeta?.forwardRef) {
    lines.push('');
    lines.push(generateRefHandling(reactMeta.forwardRef));
  }

  // State declarations (from component.state)
  if (Object.keys(component.state).length > 0) {
    lines.push('');
    lines.push(generateStateDeclarations(component));
  }

  // Toggle/handler functions for interactive components
  const handlers = generateHandlerFunctions(props);
  if (handlers) {
    lines.push('');
    lines.push(handlers);
  }

  return lines.filter(line => line !== undefined).join('\n');
}

/**
 * Generates import statements for the Vue component.
 */
function generateImports(
  component: ExtendedMitosisComponent,
  reactMeta: ExtendedMitosisComponent['meta']['reactMeta'],
  cnImportPath: string,
  props: PropDefinition[],
  baseClasses?: string,
  stateProps: PropDefinition[] = []
): string {
  const imports: string[] = [];
  const vueImports: string[] = [];

  // Check what Vue imports we need
  if (reactMeta?.forwardRef) {
    vueImports.push('ref');
    // Note: We don't import type Ref since we use ref<T>() inline typing
  }

  if (Object.keys(component.state || {}).length > 0) {
    if (!vueImports.includes('ref')) vueImports.push('ref');
  }

  // Check for computed values (including data-state computed)
  const hasComputed = Object.values(component.state || {}).some(
    s => typeof s === 'object' && s !== null && 'code' in s
  ) || stateProps.length > 0;
  if (hasComputed) {
    vueImports.push('computed');
  }

  // Add Vue imports
  if (vueImports.length > 0) {
    imports.push(`import { ${vueImports.join(', ')} } from 'vue';`);
  }

  // cn utility import (also needed when we have baseClasses)
  if (reactMeta?.usesCn || baseClasses) {
    imports.push(`import { cn } from '${cnImportPath}';`);
  }

  // CVA import (no VariantProps - Vue can't resolve it at compile time)
  if (reactMeta?.cva) {
    imports.push(`import { cva } from 'class-variance-authority';`);
  }

  // Other imports from original component (filtered)
  if (reactMeta?.originalImports) {
    for (const imp of reactMeta.originalImports) {
      // Skip React imports
      if (imp.category === 'react') continue;

      // Skip cn/cva imports (already handled)
      if (imp.namedImports?.includes('cn') || imp.namedImports?.includes('cva')) continue;

      // Skip Radix imports (not supported in POC)
      if (imp.category === 'radix') continue;

      // Transform import source for framework-specific packages
      let source = imp.source;

      // Map lucide-react to lucide-vue-next
      if (source === 'lucide-react') {
        source = 'lucide-vue-next';
      }

      // Include other imports
      if (imp.namedImports && imp.namedImports.length > 0) {
        const filteredImports = imp.namedImports.filter(
          name => name !== 'cn' && name !== 'cva' && name !== 'VariantProps'
        );
        if (filteredImports.length > 0) {
          imports.push(`import { ${filteredImports.join(', ')} } from '${source}';`);
        }
      } else if (imp.defaultImport) {
        imports.push(`import ${imp.defaultImport} from '${source}';`);
      }
    }
  }

  return imports.join('\n');
}

/**
 * Generates the CVA definition.
 */
function generateCvaDefinition(cva: CvaConfig): string {
  const lines: string[] = [];

  lines.push(`const ${cva.name} = cva(`);
  lines.push(`  '${cva.baseClasses}',`);
  lines.push(`  {`);

  // Variants
  lines.push(`    variants: {`);
  for (const [variantName, variantValues] of Object.entries(cva.variants)) {
    lines.push(`      ${variantName}: {`);
    for (const [valueName, classes] of Object.entries(variantValues)) {
      lines.push(`        ${valueName}: '${classes}',`);
    }
    lines.push(`      },`);
  }
  lines.push(`    },`);

  // Default variants
  lines.push(`    defaultVariants: {`);
  for (const [name, value] of Object.entries(cva.defaultVariants)) {
    lines.push(`      ${name}: '${value}',`);
  }
  lines.push(`    },`);

  lines.push(`  }`);
  lines.push(`);`);

  return lines.join('\n');
}

/**
 * Generates the Props interface for TypeScript.
 * Note: Vue's compiler cannot resolve VariantProps<typeof ...> at compile time,
 * so we expand the variant types directly into the interface.
 */
function generatePropsInterface(
  props: PropDefinition[],
  reactMeta: ExtendedMitosisComponent['meta']['reactMeta'],
  baseClasses?: string
): string {
  const lines: string[] = [];

  // Note: We don't use extends VariantProps<...> because Vue's compiler
  // cannot resolve it. Instead, we inline the variant prop types.
  lines.push(`interface Props {`);

  // Add custom props
  for (const prop of props) {
    if (!prop.isVariant && prop.name !== 'className') {
      const optional = prop.optional ? '?' : '';
      lines.push(`  ${prop.name}${optional}: ${prop.type};`);
    }
  }

  // Add class prop (Vue uses class, not className)
  // Add when explicitly defined, when component has baseClasses, or when using CVA
  const classNameProp = props.find(p => p.name === 'className' || p.name === 'class');
  if (classNameProp || baseClasses || reactMeta?.cva) {
    lines.push(`  class?: string;`);
  }

  // Add variant props explicitly if using CVA
  if (reactMeta?.cva) {
    for (const [variantName, variantValues] of Object.entries(reactMeta.cva.variants)) {
      const values = Object.keys(variantValues).map(v => `'${v}'`).join(' | ');
      lines.push(`  ${variantName}?: ${values};`);
    }
  }

  lines.push(`}`);

  return lines.join('\n');
}

/**
 * Generates defineProps with withDefaults.
 */
function generatePropsDefinition(
  props: PropDefinition[],
  reactMeta: ExtendedMitosisComponent['meta']['reactMeta'],
  typescript: boolean
): string {
  const lines: string[] = [];

  // Collect default values
  const defaults: Record<string, string> = {};

  // Add variant defaults from CVA
  if (reactMeta?.cva) {
    for (const [name, value] of Object.entries(reactMeta.cva.defaultVariants)) {
      defaults[name] = `'${value}'`;
    }
  }

  // Add other prop defaults
  for (const prop of props) {
    if (prop.defaultValue !== undefined && !defaults[prop.name]) {
      const val = prop.defaultValue;
      // Check if value is already a quoted string (e.g., "\"horizontal\"")
      if (typeof val === 'string' && val.startsWith('"') && val.endsWith('"')) {
        // Convert double-quoted string to single-quoted for consistency
        defaults[prop.name] = `'${val.slice(1, -1)}'`;
      } else if (typeof val === 'string' && !['true', 'false', 'null', 'undefined'].includes(val) && !val.match(/^\d/)) {
        // It's a string that needs quotes (not a boolean/null/number literal)
        defaults[prop.name] = `'${val}'`;
      } else {
        // It's a literal (true, false, number, etc.)
        defaults[prop.name] = String(val);
      }
    }
  }

  // Generate defineProps
  if (typescript) {
    if (Object.keys(defaults).length > 0) {
      lines.push(`const props = withDefaults(defineProps<Props>(), {`);
      for (const [name, value] of Object.entries(defaults)) {
        lines.push(`  ${name}: ${value},`);
      }
      lines.push(`});`);
    } else {
      lines.push(`const props = defineProps<Props>();`);
    }
  } else {
    lines.push(`const props = defineProps({`);
    for (const prop of props) {
      const type = mapTypeToVueType(prop.type);
      const defaultValue = defaults[prop.name];
      if (defaultValue) {
        lines.push(`  ${prop.name}: { type: ${type}, default: ${defaultValue} },`);
      } else if (!prop.optional) {
        lines.push(`  ${prop.name}: { type: ${type}, required: true },`);
      } else {
        lines.push(`  ${prop.name}: ${type},`);
      }
    }
    lines.push(`});`);
  }

  return lines.join('\n');
}

/**
 * Generates ref handling for forwardRef equivalent.
 */
function generateRefHandling(forwardRef: { elementType: string; paramName: string }): string {
  const lines: string[] = [];

  // Use elementRef to avoid conflict with Vue's ref import
  const refVarName = forwardRef.paramName === 'ref' ? 'elementRef' : forwardRef.paramName;

  lines.push(`const ${refVarName} = ref<${forwardRef.elementType} | null>(null);`);
  lines.push('');
  lines.push(`defineExpose({ ${refVarName} });`);

  return lines.join('\n');
}

/**
 * Generates state declarations from Mitosis state.
 */
function generateStateDeclarations(component: ExtendedMitosisComponent): string {
  const lines: string[] = [];

  for (const [name, value] of Object.entries(component.state)) {
    const initialValue = typeof value === 'object' && value !== null && 'code' in value
      ? (value as { code: string }).code
      : JSON.stringify(value);
    lines.push(`const ${name} = ref(${initialValue});`);
  }

  return lines.join('\n');
}

/**
 * Maps TypeScript types to Vue prop types.
 */
function mapTypeToVueType(tsType: string): string {
  const mapping: Record<string, string> = {
    string: 'String',
    number: 'Number',
    boolean: 'Boolean',
    object: 'Object',
    array: 'Array',
    function: 'Function',
  };

  const lowerType = tsType.toLowerCase();
  return mapping[lowerType] || 'null';
}

/**
 * Generates emit definitions for state change callbacks.
 * Converts Radix onXxxChange callbacks to Vue v-model pattern.
 */
function generateEmitDefinitions(props: PropDefinition[]): string | null {
  const emits: string[] = [];

  for (const prop of props) {
    // Convert onCheckedChange -> 'update:checked'
    if (prop.name === 'onCheckedChange') {
      emits.push(`'update:checked': [value: boolean]`);
    }
    // Convert onPressedChange -> 'update:pressed'
    if (prop.name === 'onPressedChange') {
      emits.push(`'update:pressed': [value: boolean]`);
    }
    // Convert onValueChange -> 'update:value' or 'update:modelValue'
    if (prop.name === 'onValueChange') {
      emits.push(`'update:modelValue': [value: string]`);
    }
  }

  if (emits.length === 0) return null;

  return `const emit = defineEmits<{
  ${emits.join(';\n  ')};
}>();`;
}

/**
 * Generates computed properties for data-state attributes.
 * These are used by CSS selectors like data-[state=checked].
 */
function generateDataStateComputed(stateProps: PropDefinition[]): string {
  const lines: string[] = [];

  for (const prop of stateProps) {
    if (!prop.dataStateValues) continue;

    const { true: trueValue, false: falseValue } = prop.dataStateValues;
    lines.push(`const dataState = computed(() => (props.${prop.name} ? '${trueValue}' : '${falseValue}'));`);
  }

  return lines.join('\n');
}

/**
 * Generates handler functions for interactive components.
 * Creates toggle functions that emit the appropriate events.
 */
function generateHandlerFunctions(props: PropDefinition[]): string | null {
  const lines: string[] = [];

  // Check if this is a Switch-like component (has checked and onCheckedChange)
  const hasChecked = props.some(p => p.name === 'checked');
  const hasOnCheckedChange = props.some(p => p.name === 'onCheckedChange');
  const hasDisabled = props.some(p => p.name === 'disabled');

  if (hasChecked && hasOnCheckedChange) {
    if (hasDisabled) {
      lines.push(`function toggle() {
  if (!props.disabled) {
    emit('update:checked', !props.checked);
  }
}`);
    } else {
      lines.push(`function toggle() {
  emit('update:checked', !props.checked);
}`);
    }
  }

  // Check if this is a Toggle-like component (has pressed and onPressedChange)
  const hasPressed = props.some(p => p.name === 'pressed');
  const hasOnPressedChange = props.some(p => p.name === 'onPressedChange');

  if (hasPressed && hasOnPressedChange) {
    if (hasDisabled) {
      lines.push(`function toggle() {
  if (!props.disabled) {
    emit('update:pressed', !props.pressed);
  }
}`);
    } else {
      lines.push(`function toggle() {
  emit('update:pressed', !props.pressed);
}`);
    }
  }

  return lines.length > 0 ? lines.join('\n\n') : null;
}
