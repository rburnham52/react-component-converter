import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge.
 * This is the standard cn() utility used by shadcn/ui components.
 *
 * - clsx: Conditionally constructs className strings
 * - tailwind-merge: Merges Tailwind CSS classes without style conflicts
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-blue-500", className)
 * // Returns merged class string with Tailwind conflict resolution
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generates the cn utility code for different frameworks.
 * This is used by compilers to include the cn utility in generated components.
 */
export function generateCnUtility(framework: 'svelte' | 'vue' | 'react'): string {
  const importStatement = `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';`;

  const functionBody = `export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}`;

  return `${importStatement}\n\n${functionBody}`;
}

/**
 * Generates the import statement for cn utility based on framework conventions.
 */
export function getCnImportPath(framework: 'svelte' | 'vue' | 'react'): string {
  switch (framework) {
    case 'svelte':
      return '$lib/utils';
    case 'vue':
      return '@/lib/utils';
    case 'react':
      return '@/lib/utils';
    default:
      return './utils';
  }
}
