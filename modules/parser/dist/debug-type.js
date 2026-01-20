import { Project, SyntaxKind } from 'ts-morph';
async function main() {
    const project = new Project();
    project.createSourceFile('temp.tsx', `
    import * as React from "react"
    import * as LabelPrimitive from "@radix-ui/react-label"

    const Label = React.forwardRef<
      React.ElementRef<typeof LabelPrimitive.Root>,
      React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
    >(({ className, ...props }, ref) => (
      <LabelPrimitive.Root ref={ref} className={className} {...props} />
    ))
  `);
    const sourceFile = project.getSourceFiles()[0];
    const forwardRefCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter(call => {
        const text = call.getExpression().getText();
        return text === 'forwardRef' || text === 'React.forwardRef' || text.endsWith('.forwardRef');
    });
    if (forwardRefCalls.length > 0) {
        const typeArgs = forwardRefCalls[0].getTypeArguments();
        if (typeArgs.length > 0) {
            const rawType = typeArgs[0].getText();
            console.log('Raw type:', JSON.stringify(rawType));
            console.log('Normalized:', rawType.replace(/\s+/g, ' ').trim());
            // Test regex
            const normalized = rawType.replace(/\s+/g, ' ').trim();
            const match = normalized.match(/React\.ElementRef\s*<\s*typeof\s+([^>]+)\s*>/);
            console.log('Regex match:', match);
        }
    }
}
main().catch(console.error);
//# sourceMappingURL=debug-type.js.map