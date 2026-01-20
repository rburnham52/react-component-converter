/**
 * Radix UI primitive props definitions.
 * These are the props that Radix primitives accept and that need to be
 * preserved when converting to Vue/Svelte native implementations.
 */

export interface RadixPropDefinition {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: unknown;
  description?: string;
  /** If true, this prop controls state that affects data-state attribute */
  isStateProp?: boolean;
  /** The corresponding data-state values for this prop */
  dataStateValues?: { true: string; false: string };
}

export interface RadixPrimitivePropsConfig {
  /** The Radix package (e.g., "@radix-ui/react-switch") */
  package: string;
  /** Props definitions for each component in the package */
  components: Record<string, RadixPropDefinition[]>;
}

/**
 * Common props shared by many Radix primitives
 */
const commonProps: RadixPropDefinition[] = [
  { name: 'asChild', type: 'boolean', optional: true, description: 'Use the child as the rendered element' },
];

/**
 * Props definitions for Radix UI primitives
 */
export const radixPrimitiveProps: Record<string, RadixPrimitivePropsConfig> = {
  '@radix-ui/react-switch': {
    package: '@radix-ui/react-switch',
    components: {
      Root: [
        ...commonProps,
        {
          name: 'checked',
          type: 'boolean',
          optional: true,
          description: 'The controlled checked state',
          isStateProp: true,
          dataStateValues: { true: 'checked', false: 'unchecked' }
        },
        { name: 'defaultChecked', type: 'boolean', optional: true, description: 'The default checked state for uncontrolled usage' },
        { name: 'onCheckedChange', type: '(checked: boolean) => void', optional: true, description: 'Callback when checked state changes' },
        { name: 'disabled', type: 'boolean', optional: true, description: 'Whether the switch is disabled' },
        { name: 'required', type: 'boolean', optional: true, description: 'Whether the switch is required' },
        { name: 'name', type: 'string', optional: true, description: 'Name for form submission' },
        { name: 'value', type: 'string', optional: true, defaultValue: 'on', description: 'Value for form submission' },
      ],
      Thumb: commonProps,
    },
  },

  '@radix-ui/react-checkbox': {
    package: '@radix-ui/react-checkbox',
    components: {
      Root: [
        ...commonProps,
        {
          name: 'checked',
          type: 'boolean | "indeterminate"',
          optional: true,
          isStateProp: true,
          dataStateValues: { true: 'checked', false: 'unchecked' }
        },
        { name: 'defaultChecked', type: 'boolean', optional: true },
        { name: 'onCheckedChange', type: '(checked: boolean | "indeterminate") => void', optional: true },
        { name: 'disabled', type: 'boolean', optional: true },
        { name: 'required', type: 'boolean', optional: true },
        { name: 'name', type: 'string', optional: true },
        { name: 'value', type: 'string', optional: true, defaultValue: 'on' },
      ],
      Indicator: [
        ...commonProps,
        { name: 'forceMount', type: 'boolean', optional: true },
      ],
    },
  },

  '@radix-ui/react-toggle': {
    package: '@radix-ui/react-toggle',
    components: {
      Root: [
        ...commonProps,
        {
          name: 'pressed',
          type: 'boolean',
          optional: true,
          isStateProp: true,
          dataStateValues: { true: 'on', false: 'off' }
        },
        { name: 'defaultPressed', type: 'boolean', optional: true },
        { name: 'onPressedChange', type: '(pressed: boolean) => void', optional: true },
        { name: 'disabled', type: 'boolean', optional: true },
      ],
    },
  },

  '@radix-ui/react-separator': {
    package: '@radix-ui/react-separator',
    components: {
      Root: [
        ...commonProps,
        {
          name: 'orientation',
          type: '"horizontal" | "vertical"',
          optional: true,
          defaultValue: 'horizontal',
          isStateProp: true
        },
        { name: 'decorative', type: 'boolean', optional: true, defaultValue: true },
      ],
    },
  },

  '@radix-ui/react-progress': {
    package: '@radix-ui/react-progress',
    components: {
      Root: [
        ...commonProps,
        { name: 'value', type: 'number | null', optional: true },
        { name: 'max', type: 'number', optional: true, defaultValue: 100 },
        { name: 'getValueLabel', type: '(value: number, max: number) => string', optional: true },
      ],
      Indicator: commonProps,
    },
  },

  '@radix-ui/react-slider': {
    package: '@radix-ui/react-slider',
    components: {
      Root: [
        ...commonProps,
        { name: 'value', type: 'number[]', optional: true },
        { name: 'defaultValue', type: 'number[]', optional: true },
        { name: 'onValueChange', type: '(value: number[]) => void', optional: true },
        { name: 'onValueCommit', type: '(value: number[]) => void', optional: true },
        { name: 'min', type: 'number', optional: true, defaultValue: 0 },
        { name: 'max', type: 'number', optional: true, defaultValue: 100 },
        { name: 'step', type: 'number', optional: true, defaultValue: 1 },
        { name: 'minStepsBetweenThumbs', type: 'number', optional: true, defaultValue: 0 },
        { name: 'orientation', type: '"horizontal" | "vertical"', optional: true, defaultValue: 'horizontal' },
        { name: 'disabled', type: 'boolean', optional: true },
        { name: 'inverted', type: 'boolean', optional: true },
        { name: 'name', type: 'string', optional: true },
      ],
      Track: commonProps,
      Range: commonProps,
      Thumb: commonProps,
    },
  },

  '@radix-ui/react-tabs': {
    package: '@radix-ui/react-tabs',
    components: {
      Root: [
        ...commonProps,
        { name: 'value', type: 'string', optional: true },
        { name: 'defaultValue', type: 'string', optional: true },
        { name: 'onValueChange', type: '(value: string) => void', optional: true },
        { name: 'orientation', type: '"horizontal" | "vertical"', optional: true, defaultValue: 'horizontal' },
        { name: 'dir', type: '"ltr" | "rtl"', optional: true },
        { name: 'activationMode', type: '"automatic" | "manual"', optional: true, defaultValue: 'automatic' },
      ],
      List: [
        ...commonProps,
        { name: 'loop', type: 'boolean', optional: true, defaultValue: true },
      ],
      Trigger: [
        ...commonProps,
        { name: 'value', type: 'string', optional: false },
        { name: 'disabled', type: 'boolean', optional: true },
      ],
      Content: [
        ...commonProps,
        { name: 'value', type: 'string', optional: false },
        { name: 'forceMount', type: 'boolean', optional: true },
      ],
    },
  },

  '@radix-ui/react-accordion': {
    package: '@radix-ui/react-accordion',
    components: {
      Root: [
        ...commonProps,
        { name: 'type', type: '"single" | "multiple"', optional: false },
        { name: 'value', type: 'string | string[]', optional: true },
        { name: 'defaultValue', type: 'string | string[]', optional: true },
        { name: 'onValueChange', type: '(value: string | string[]) => void', optional: true },
        { name: 'collapsible', type: 'boolean', optional: true },
        { name: 'disabled', type: 'boolean', optional: true },
        { name: 'dir', type: '"ltr" | "rtl"', optional: true },
        { name: 'orientation', type: '"horizontal" | "vertical"', optional: true, defaultValue: 'vertical' },
      ],
      Item: [
        ...commonProps,
        { name: 'value', type: 'string', optional: false },
        { name: 'disabled', type: 'boolean', optional: true },
      ],
      Header: commonProps,
      Trigger: commonProps,
      Content: [
        ...commonProps,
        { name: 'forceMount', type: 'boolean', optional: true },
      ],
    },
  },

  '@radix-ui/react-radio-group': {
    package: '@radix-ui/react-radio-group',
    components: {
      Root: [
        ...commonProps,
        { name: 'value', type: 'string', optional: true },
        { name: 'defaultValue', type: 'string', optional: true },
        { name: 'onValueChange', type: '(value: string) => void', optional: true },
        { name: 'disabled', type: 'boolean', optional: true },
        { name: 'required', type: 'boolean', optional: true },
        { name: 'name', type: 'string', optional: true },
        { name: 'orientation', type: '"horizontal" | "vertical"', optional: true },
        { name: 'dir', type: '"ltr" | "rtl"', optional: true },
        { name: 'loop', type: 'boolean', optional: true, defaultValue: true },
      ],
      Item: [
        ...commonProps,
        { name: 'value', type: 'string', optional: false },
        { name: 'disabled', type: 'boolean', optional: true },
        { name: 'required', type: 'boolean', optional: true },
      ],
      Indicator: [
        ...commonProps,
        { name: 'forceMount', type: 'boolean', optional: true },
      ],
    },
  },

  '@radix-ui/react-label': {
    package: '@radix-ui/react-label',
    components: {
      Root: [
        ...commonProps,
        { name: 'htmlFor', type: 'string', optional: true },
      ],
    },
  },

  '@radix-ui/react-avatar': {
    package: '@radix-ui/react-avatar',
    components: {
      Root: commonProps,
      Image: [
        ...commonProps,
        { name: 'onLoadingStatusChange', type: '(status: "idle" | "loading" | "loaded" | "error") => void', optional: true },
      ],
      Fallback: [
        ...commonProps,
        { name: 'delayMs', type: 'number', optional: true },
      ],
    },
  },

  '@radix-ui/react-scroll-area': {
    package: '@radix-ui/react-scroll-area',
    components: {
      Root: [
        ...commonProps,
        { name: 'type', type: '"auto" | "always" | "scroll" | "hover"', optional: true, defaultValue: 'hover' },
        { name: 'scrollHideDelay', type: 'number', optional: true, defaultValue: 600 },
        { name: 'dir', type: '"ltr" | "rtl"', optional: true },
      ],
      Viewport: commonProps,
      Scrollbar: [
        ...commonProps,
        { name: 'orientation', type: '"horizontal" | "vertical"', optional: true, defaultValue: 'vertical' },
        { name: 'forceMount', type: 'boolean', optional: true },
      ],
      Thumb: commonProps,
      Corner: commonProps,
    },
  },
};

/**
 * Get props for a specific Radix primitive component
 */
export function getRadixPrimitiveProps(
  packageName: string,
  componentName: string
): RadixPropDefinition[] | undefined {
  const config = radixPrimitiveProps[packageName];
  if (!config) return undefined;
  return config.components[componentName];
}

/**
 * Get all packages that have prop definitions
 */
export function getSupportedRadixPackagesWithProps(): string[] {
  return Object.keys(radixPrimitiveProps);
}

/**
 * Check if a component has state props that affect data-state attribute
 */
export function hasStateProp(packageName: string, componentName: string): boolean {
  const props = getRadixPrimitiveProps(packageName, componentName);
  if (!props) return false;
  return props.some(p => p.isStateProp);
}

/**
 * Get the state prop and its data-state values for a component
 */
export function getStatePropInfo(
  packageName: string,
  componentName: string
): { propName: string; dataStateValues: { true: string; false: string } } | undefined {
  const props = getRadixPrimitiveProps(packageName, componentName);
  if (!props) return undefined;

  const stateProp = props.find(p => p.isStateProp && p.dataStateValues);
  if (!stateProp || !stateProp.dataStateValues) return undefined;

  return {
    propName: stateProp.name,
    dataStateValues: stateProp.dataStateValues
  };
}
