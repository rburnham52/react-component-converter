#!/usr/bin/env node
import { Command } from 'commander';
import { createParseCommand } from './commands/parse.js';
import { createCompileCommand } from './commands/compile.js';
import { createConvertCommand } from './commands/convert.js';
const program = new Command();
program
    .name('component-converter')
    .description('Convert React components to Svelte or Vue')
    .version('0.1.0');
// Add commands
program.addCommand(createParseCommand());
program.addCommand(createCompileCommand());
program.addCommand(createConvertCommand());
// Parse arguments
program.parse();
//# sourceMappingURL=index.js.map