import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { parseComponent } from '@component-converter/parser';
import { compileToSvelte } from '@component-converter/compiler-svelte';
import { compileToVue } from '@component-converter/compiler-vue';

/**
 * Creates the 'convert' command that directly converts React TSX to Svelte or Vue.
 *
 * This command uses the custom parser (which handles standard React patterns like
 * forwardRef, CVA, cn) combined with the custom compilers that generate proper
 * Svelte 5 runes and Vue 3 Composition API code.
 *
 * Architecture:
 * - Parser: Uses ts-morph to analyze React TSX, extracting CVA, forwardRef, cn patterns
 * - Compiler: Generates Svelte 5 runes ($props, $bindable) or Vue 3 Composition API
 *
 * Note: The new Mitosis-based plugin architecture in @component-converter/core is
 * available for Mitosis-format components. For standard React components, this
 * custom parser/compiler pipeline provides better support.
 */
export function createConvertCommand(): Command {
  const command = new Command('convert');

  command
    .description('Convert a React component to Svelte or Vue')
    .argument('<input>', 'Input React TSX file path')
    .requiredOption('-t, --target <framework>', 'Target framework: svelte | vue')
    .option('-o, --output <file>', 'Output file path (default: stdout)')
    .option('-f, --format', 'Format output with Prettier', true)
    .option('--svelte-version <version>', 'Svelte version: 4 | 5', '5')
    .option('--vue-version <version>', 'Vue version: 3', '3')
    .option('--no-typescript', 'Output JavaScript instead of TypeScript')
    .option('-v, --verbose', 'Show detailed conversion information', false)
    .option('-a, --all', 'Convert all components in the file (for multi-component files)', false)
    .action(async (input: string, options) => {
      const spinner = ora('Converting component...').start();

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
        } catch {
          spinner.fail(chalk.red(`File not found: ${inputPath}`));
          process.exit(1);
        }

        // Step 1: Parse
        spinner.text = 'Parsing React component...';
        const code = await fs.readFile(inputPath, 'utf-8');
        const parseResult = await parseComponent(code, {
          preserveFormatting: true,
          extractJsDoc: true,
        });

        // Show warnings
        if (parseResult.warnings.length > 0 && options.verbose) {
          spinner.info(chalk.yellow('Parse warnings:'));
          for (const warning of parseResult.warnings) {
            console.log(chalk.yellow(`  ⚠ ${warning}`));
          }
          spinner.start('Continuing conversion...');
        }

        // Determine which components to convert
        const componentsToConvert = options.all
          ? parseResult.components.filter((c) => !c.isReExport)
          : [{ name: parseResult.component.name, component: parseResult.component, props: parseResult.props }];

        // Step 2: Compile each component
        const outputs: Array<{ name: string; output: string }> = [];

        for (const componentInfo of componentsToConvert) {
          spinner.text = `Compiling ${componentInfo.name} to ${target}...`;

          const componentProps = componentInfo.props || [];
          let output: string;

          if (target === 'svelte') {
            output = await compileToSvelte(componentInfo.component, componentProps, {
              typescript: options.typescript !== false,
              format: options.format,
              svelteVersion: parseInt(options.svelteVersion) as 4 | 5,
              useRunes: options.svelteVersion === '5',
            });
          } else {
            output = await compileToVue(componentInfo.component, componentProps, {
              typescript: options.typescript !== false,
              format: options.format,
              vueVersion: parseInt(options.vueVersion) as 3,
              scriptSetup: true,
            });
          }

          outputs.push({ name: componentInfo.name, output });
        }

        spinner.succeed(
          chalk.green(
            `Converted ${outputs.length} component${outputs.length > 1 ? 's' : ''} to ${target} successfully`
          )
        );

        // Verbose output
        if (options.verbose) {
          console.log(chalk.cyan('\nConversion Summary:'));
          console.log(`  Components: ${outputs.map((o) => o.name).join(', ')}`);
          console.log(`  Target: ${target} ${target === 'svelte' ? options.svelteVersion : options.vueVersion}`);

          const reactMeta = parseResult.component.meta.reactMeta;
          if (reactMeta?.forwardRef) {
            console.log(`  Ref handling: converted`);
          }
          if (reactMeta?.usesCn) {
            console.log(`  cn(): used`);
          }
        }

        // Write output
        if (options.output && outputs.length === 1) {
          // Single component - write to specified file
          const outputPath = path.resolve(process.cwd(), options.output);
          await fs.writeFile(outputPath, outputs[0].output, 'utf-8');
          console.log(chalk.green(`\nComponent written to: ${outputPath}`));
        } else if (options.output && outputs.length > 1) {
          // Multiple components - use output as directory
          const outputDir = path.resolve(process.cwd(), options.output);
          await fs.mkdir(outputDir, { recursive: true });

          const extension = target === 'svelte' ? '.svelte' : '.vue';
          for (const { name, output } of outputs) {
            const fileName = `${name}${extension}`;
            const filePath = path.join(outputDir, fileName);
            await fs.writeFile(filePath, output, 'utf-8');
          }
          console.log(chalk.green(`\n${outputs.length} components written to: ${outputDir}/`));
        } else {
          // Output to stdout
          for (const { name, output } of outputs) {
            if (outputs.length > 1) {
              console.log(chalk.cyan(`\n// ===== ${name} =====`));
            }
            console.log('\n' + output);
          }
        }
      } catch (error) {
        spinner.fail(chalk.red('Conversion failed'));
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        if (options.verbose && error instanceof Error && error.stack) {
          console.error(chalk.gray(error.stack));
        }
        process.exit(1);
      }
    });

  return command;
}
