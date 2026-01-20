import { SourceFile, SyntaxKind } from 'ts-morph';
import type { OriginalImport } from '@react-component-converter/core';

/**
 * Analyzes imports from a React component to categorize them
 * for framework-specific handling during compilation.
 */
export function analyzeImports(sourceFile: SourceFile): OriginalImport[] {
  const imports: OriginalImport[] = [];

  for (const importDecl of sourceFile.getImportDeclarations()) {
    const source = importDecl.getModuleSpecifierValue();
    const namedImports: string[] = [];
    let defaultImport: string | undefined;

    // Get default import
    const defaultImportNode = importDecl.getDefaultImport();
    if (defaultImportNode) {
      defaultImport = defaultImportNode.getText();
    }

    // Get named imports
    const namedBindings = importDecl.getNamedImports();
    for (const named of namedBindings) {
      namedImports.push(named.getName());
    }

    // Get namespace import (import * as X from ...)
    const namespaceImport = importDecl.getNamespaceImport();
    if (namespaceImport) {
      defaultImport = `* as ${namespaceImport.getText()}`;
    }

    // Categorize the import
    const category = categorizeImport(source, namedImports, defaultImport);

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
 * Categorizes an import based on its source and content.
 */
function categorizeImport(
  source: string,
  namedImports: string[],
  defaultImport?: string
): OriginalImport['category'] {
  // React imports
  if (source === 'react' || source.startsWith('react/') || source.startsWith('react-dom')) {
    return 'react';
  }

  // Radix UI imports
  if (source.startsWith('@radix-ui/')) {
    return 'radix';
  }

  // Utility imports (cn, cva, clsx, tailwind-merge)
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

  // Style imports (CSS, SCSS, etc.)
  if (
    source.endsWith('.css') ||
    source.endsWith('.scss') ||
    source.endsWith('.sass') ||
    source.endsWith('.less') ||
    source.includes('styles')
  ) {
    return 'style';
  }

  return 'other';
}

/**
 * Checks if the component uses the cn() utility.
 */
export function usesCnUtility(sourceFile: SourceFile): boolean {
  const imports = analyzeImports(sourceFile);

  // Check if cn is imported
  const hasCnImport = imports.some(
    imp => imp.namedImports?.includes('cn') || imp.defaultImport === 'cn'
  );

  if (!hasCnImport) {
    return false;
  }

  // Check if cn is actually used in the code
  const cnCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(call => call.getExpression().getText() === 'cn');

  return cnCalls.length > 0;
}

/**
 * Gets React-specific imports that need to be removed or transformed.
 */
export function getReactImports(sourceFile: SourceFile): OriginalImport[] {
  return analyzeImports(sourceFile).filter(imp => imp.category === 'react');
}

/**
 * Gets Radix UI imports that may need alternative handling.
 */
export function getRadixImports(sourceFile: SourceFile): OriginalImport[] {
  return analyzeImports(sourceFile).filter(imp => imp.category === 'radix');
}
