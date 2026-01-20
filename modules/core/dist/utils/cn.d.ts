import { type ClassValue } from 'clsx';
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
export declare function cn(...inputs: ClassValue[]): string;
/**
 * Generates the cn utility code for different frameworks.
 * This is used by compilers to include the cn utility in generated components.
 */
export declare function generateCnUtility(framework: 'svelte' | 'vue' | 'react'): string;
/**
 * Generates the import statement for cn utility based on framework conventions.
 */
export declare function getCnImportPath(framework: 'svelte' | 'vue' | 'react'): string;
//# sourceMappingURL=cn.d.ts.map