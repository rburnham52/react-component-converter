import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { compileToSvelte, compileAllToSvelte } from '@component-converter/compiler-svelte';
import { compileToVue, compileAllToVue } from '@component-converter/compiler-vue';
/**
 * Creates the 'compile' command that converts IR to Svelte or Vue.
 */
export function createCompileCommand() {
    const command = new Command('compile');
    command
        .description('Compile IR (JSON) to Svelte or Vue component')
        .argument('<input>', 'Input IR JSON file path')
        .requiredOption('-t, --target <framework>', 'Target framework: svelte | vue')
        .option('-o, --output <file>', 'Output file path (or directory for multi-component files)')
        .option('-f, --format', 'Format output with Prettier', true)
        .option('--svelte-version <version>', 'Svelte version: 4 | 5', '5')
        .option('--vue-version <version>', 'Vue version: 3', '3')
        .option('--no-typescript', 'Output JavaScript instead of TypeScript')
        .option('--all', 'Compile all components in the file (for multi-component files)')
        .action(async (input, options) => {
        const spinner = ora('Compiling component...').start();
        try {
            // Validate target
            const target = options.target.toLowerCase();
            if (target !== 'svelte' && target !== 'vue') {
                spinner.fail(chalk.red(`Invalid target: ${options.target}. Use 'svelte' or 'vue'.`));
                process.exit(1);
            }
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
            // Read and parse IR
            const irJson = await fs.readFile(inputPath, 'utf-8');
            let irData;
            try {
                irData = JSON.parse(irJson);
            }
            catch {
                spinner.fail(chalk.red('Invalid JSON in IR file'));
                process.exit(1);
            }
            // Validate IR structure
            if (!irData.component) {
                spinner.fail(chalk.red('Invalid IR structure: missing component'));
                process.exit(1);
            }
            // Check if this is a multi-component file and --all flag is set
            const hasMultipleComponents = irData.components && irData.components.length > 1;
            if (options.all && hasMultipleComponents) {
                // Compile all components
                spinner.text = `Compiling ${irData.components.length} components...`;
                const compilerOptions = {
                    typescript: options.typescript !== false,
                    format: options.format,
                };
                let results;
                if (target === 'svelte') {
                    results = await compileAllToSvelte(irData, {
                        ...compilerOptions,
                        svelteVersion: parseInt(options.svelteVersion),
                        useRunes: options.svelteVersion === '5',
                    });
                }
                else {
                    results = await compileAllToVue(irData, {
                        ...compilerOptions,
                        vueVersion: parseInt(options.vueVersion),
                        scriptSetup: true,
                    });
                }
                spinner.succeed(chalk.green(`Compiled ${results.size} components to ${target}`));
                // Write outputs
                if (options.output) {
                    const outputDir = path.resolve(process.cwd(), options.output);
                    // Create directory if it doesn't exist
                    await fs.mkdir(outputDir, { recursive: true });
                    for (const [filename, code] of results) {
                        const outputPath = path.join(outputDir, filename);
                        await fs.writeFile(outputPath, code, 'utf-8');
                        console.log(chalk.green(`  ✓ ${filename}`));
                    }
                    console.log(chalk.green(`\nComponents written to: ${outputDir}`));
                }
                else {
                    // Output to stdout
                    for (const [filename, code] of results) {
                        console.log(chalk.cyan(`\n--- ${filename} ---\n`));
                        console.log(code);
                    }
                }
            }
            else {
                // Compile single component (primary component)
                const component = irData.component;
                const props = irData.props || [];
                let output;
                if (target === 'svelte') {
                    output = await compileToSvelte(component, props, {
                        typescript: options.typescript !== false,
                        format: options.format,
                        svelteVersion: parseInt(options.svelteVersion),
                        useRunes: options.svelteVersion === '5',
                    });
                }
                else {
                    output = await compileToVue(component, props, {
                        typescript: options.typescript !== false,
                        format: options.format,
                        vueVersion: parseInt(options.vueVersion),
                        scriptSetup: true,
                    });
                }
                spinner.succeed(chalk.green(`Compiled to ${target} successfully`));
                // Show info about other components if present
                if (hasMultipleComponents) {
                    console.log(chalk.yellow(`\nNote: File contains ${irData.components.length} components. Use --all to compile all.`));
                    console.log(chalk.yellow(`  Components: ${irData.components.map(c => c.name).join(', ')}`));
                }
                // Write output
                if (options.output) {
                    const outputPath = path.resolve(process.cwd(), options.output);
                    await fs.writeFile(outputPath, output, 'utf-8');
                    console.log(chalk.green(`\nComponent written to: ${outputPath}`));
                }
                else {
                    console.log('\n' + output);
                }
            }
        }
        catch (error) {
            spinner.fail(chalk.red('Compilation failed'));
            console.error(chalk.red(error instanceof Error ? error.message : String(error)));
            process.exit(1);
        }
    });
    return command;
}
//# sourceMappingURL=compile.js.map