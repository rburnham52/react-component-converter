import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { parseComponent } from '@component-converter/parser';
/**
 * Creates the 'parse' command that converts React TSX to IR (JSON).
 */
export function createParseCommand() {
    const command = new Command('parse');
    command
        .description('Parse a React component and output Mitosis IR with React metadata')
        .argument('<input>', 'Input React TSX file path')
        .option('-o, --output <file>', 'Output file path (default: stdout)')
        .option('-p, --pretty', 'Pretty-print JSON output', false)
        .option('-v, --verbose', 'Show detailed parsing information', false)
        .option('--validate', 'Validate IR schema after parsing', false)
        .action(async (input, options) => {
        const spinner = ora('Parsing component...').start();
        try {
            // Resolve input path
            const inputPath = path.resolve(process.cwd(), input);
            // Check if file exists
            try {
                await fs.access(inputPath);
            }
            catch {
                spinner.fail(chalk.red(`File not found: ${inputPath}`));
                process.exit(1);
            }
            // Read the file
            const code = await fs.readFile(inputPath, 'utf-8');
            // Parse the component
            const result = await parseComponent(code, {
                preserveFormatting: true,
                extractJsDoc: true,
            });
            spinner.succeed(chalk.green('Component parsed successfully'));
            // Show warnings
            if (result.warnings.length > 0) {
                console.log(chalk.yellow('\nWarnings:'));
                for (const warning of result.warnings) {
                    console.log(chalk.yellow(`  ⚠ ${warning}`));
                }
            }
            // Show errors
            if (result.errors.length > 0) {
                console.log(chalk.red('\nErrors:'));
                for (const error of result.errors) {
                    console.log(chalk.red(`  ✗ ${error}`));
                }
            }
            // Verbose output
            if (options.verbose) {
                console.log(chalk.cyan('\nComponent Info:'));
                console.log(`  Primary Component: ${result.component.name}`);
                console.log(`  Total Components: ${result.components.length}`);
                console.log(`  Components: ${result.components.map(c => c.name).join(', ')}`);
                console.log(`  Props: ${result.props.length}`);
                const reactMeta = result.component.meta.reactMeta;
                if (reactMeta?.cva) {
                    console.log(`  CVA: ${reactMeta.cva.name}`);
                    console.log(`    Variants: ${Object.keys(reactMeta.cva.variants).join(', ')}`);
                }
                if (reactMeta?.forwardRef) {
                    console.log(`  forwardRef: ${reactMeta.forwardRef.elementType}`);
                }
                if (reactMeta?.usesCn) {
                    console.log(`  Uses cn(): yes`);
                }
                // Show all CVA definitions
                const cvaCount = Object.keys(result.sharedMeta.cvaConfigs).length;
                if (cvaCount > 0) {
                    console.log(`  CVA Definitions: ${Object.keys(result.sharedMeta.cvaConfigs).join(', ')}`);
                }
            }
            // Prepare output - include all components
            const outputData = {
                component: result.component,
                components: result.components,
                props: result.props,
                sharedMeta: result.sharedMeta,
            };
            const jsonOutput = options.pretty
                ? JSON.stringify(outputData, null, 2)
                : JSON.stringify(outputData);
            // Write output
            if (options.output) {
                const outputPath = path.resolve(process.cwd(), options.output);
                await fs.writeFile(outputPath, jsonOutput, 'utf-8');
                console.log(chalk.green(`\nIR written to: ${outputPath}`));
            }
            else {
                console.log('\n' + jsonOutput);
            }
        }
        catch (error) {
            spinner.fail(chalk.red('Parsing failed'));
            console.error(chalk.red(error instanceof Error ? error.message : String(error)));
            process.exit(1);
        }
    });
    return command;
}
//# sourceMappingURL=parse.js.map