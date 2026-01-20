import { SourceFile } from 'ts-morph';
import type { ForwardRefConfig } from '@component-converter/core';
/**
 * Analyzes a source file to extract React.forwardRef configuration.
 *
 * forwardRef pattern example:
 * ```ts
 * const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 *   ({ className, ...props }, ref) => (
 *     <button ref={ref} {...props} />
 *   )
 * )
 * ```
 */
export declare function analyzeForwardRef(sourceFile: SourceFile): ForwardRefConfig | undefined;
/**
 * Checks if a component uses forwardRef.
 */
export declare function hasForwardRef(sourceFile: SourceFile): boolean;
/**
 * Extracts the component name from a forwardRef declaration.
 * e.g., "const Button = React.forwardRef..." returns "Button"
 */
export declare function getForwardRefComponentName(sourceFile: SourceFile): string | undefined;
//# sourceMappingURL=forward-ref.d.ts.map