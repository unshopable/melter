import fg from 'fast-glob';
import { promises as fs } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

async function run() {
  const files = await fg('*.cjs', {
    ignore: ['chunk-*'],
    absolute: true,
    cwd: resolve(dirname(fileURLToPath(import.meta.url)), '../dist'),
  });

  for (const file of files) {
    let code = await fs.readFile(file, 'utf8');
    code = code.replace('exports.default =', 'module.exports =');
    code += 'exports.default = module.exports;';

    await fs.writeFile(file, code);
  }
}

run();
