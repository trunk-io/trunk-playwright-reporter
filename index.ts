import { build } from 'bun';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

async function buildReporter() {
  console.log('Building trunk-playwright-reporter...');
  
  // Ensure dist directory exists
  if (!existsSync('./dist')) {
    await mkdir('./dist', { recursive: true });
  }
  
  const result = await build({
    entrypoints: ['./src/reporter.ts'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
    minify: false,
    sourcemap: 'external',
  });

  if (result.success) {
    console.log('✅ Build successful!');
    console.log('Output files:', result.outputs.map(output => output.path));
    
    // Copy necessary files for publishing
    console.log('📁 Copying files for publishing...');
    try {
      // Copy package.json and modify paths for dist folder
      const packageJson = JSON.parse(await readFile('./package.json', 'utf-8'));
      packageJson.module = './reporter.js';
      packageJson.main = './reporter.js';
      packageJson.exports = {
        ".": {
          "import": "./reporter.js",
          "require": "./reporter.js"
        }
      };
      // Remove build script since it's not needed in published package
      delete packageJson.scripts;
      delete packageJson.devDependencies;
      
      await writeFile('./dist/package.json', JSON.stringify(packageJson, null, 2));
      
      await copyFile('./SECURITY.md', './dist/SECURITY.md');
      await copyFile('./README.md', './dist/README.md');
      await copyFile('./LICENSE', './dist/LICENSE');
      console.log('✅ Files copied successfully!');
    } catch (error) {
      console.error('❌ Error copying files:', error);
      process.exit(1);
    }
  } else {
    console.error('❌ Build failed!');
    console.error('Logs:', result.logs);
    process.exit(1);
  }
}

buildReporter().catch(console.error);
