#!/usr/bin/env node

/**
 * Demo Conversion Script
 * Converts all React shadcn components from playground to Svelte and Vue demos
 *
 * Usage:
 *   node scripts/convert-demos.mjs           # Convert all to both Svelte and Vue
 *   node scripts/convert-demos.mjs svelte    # Convert all to Svelte only
 *   node scripts/convert-demos.mjs vue       # Convert all to Vue only
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CLI = 'node modules/cli/dist/index.js';
const PLAYGROUND = path.join(ROOT, 'playground/src/components/ui');
const SVELTE_OUT = path.join(ROOT, 'demos/svelte-demo/src/lib/components/ui');
const VUE_OUT = path.join(ROOT, 'demos/vue-demo/src/lib/components/ui');

// Parse arguments
const target = process.argv[2] || 'both'; // svelte, vue, or both

console.log('🔄 Component Converter - Demo Generation');
console.log(`Target: ${target}`);
console.log(`Source: ${PLAYGROUND}/*.tsx`);
console.log('');

// Get component name from file (e.g., button.tsx -> Button)
function getComponentName(filePath) {
  const fileName = path.basename(filePath, '.tsx');
  // Convert kebab-case to PascalCase
  return fileName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// Convert a single file (handles multi-component files with --all flag)
function convertFile(inputPath, targetFramework) {
  const name = getComponentName(inputPath);
  const outDir = targetFramework === 'svelte' ? SVELTE_OUT : VUE_OUT;

  process.stdout.write(`  ${name}...`);

  try {
    // Use --all flag to convert all components in the file
    // The CLI will output multiple files to the directory when --all is used
    execSync(`${CLI} convert "${inputPath}" -t ${targetFramework} -o "${outDir}" --all`, {
      cwd: ROOT,
      stdio: 'pipe',
    });
    console.log(' ✅');
    return true;
  } catch (error) {
    console.log(' ❌');
    return false;
  }
}

// Get all .tsx files in playground
function getPlaygroundFiles() {
  return fs.readdirSync(PLAYGROUND)
    .filter(f => f.endsWith('.tsx'))
    .map(f => path.join(PLAYGROUND, f));
}

// Main conversion logic
function convert(targetFramework) {
  const outDir = targetFramework === 'svelte' ? SVELTE_OUT : VUE_OUT;

  console.log('');
  console.log(`📦 Converting to ${targetFramework.toUpperCase()}...`);
  console.log(`   Output: ${outDir}`);
  console.log('');

  // Clean and recreate output directory
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  const files = getPlaygroundFiles();
  let success = 0;
  let failed = 0;

  for (const file of files) {
    if (convertFile(file, targetFramework)) {
      success++;
    } else {
      failed++;
    }
  }

  console.log('');
  console.log(`  ${targetFramework}: ${success} succeeded, ${failed} failed`);
}

// Run conversions
if (target === 'svelte' || target === 'both') {
  convert('svelte');
}

if (target === 'vue' || target === 'both') {
  convert('vue');
}

console.log('');
console.log('✅ Done!');
