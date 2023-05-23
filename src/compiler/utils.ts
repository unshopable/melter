import fs from 'fs-extra';
import path from 'path';

const appDirectory = fs.realpathSync(process.cwd());

export function resolveAppPath(...paths: string[]) {
  return path.resolve(appDirectory, ...paths);
}

const shopifyPaths = {
  assets: 'assets',
  config: 'config',
  layout: 'layout',
  locales: 'locales',
  sections: 'sections',
  snippets: 'snippets',
  templates: 'templates',
};

export function setupOutputDirectory(outputPath: string, clean: boolean = false): void {
  if (clean) {
    // Remove all content of the output directory but keep the directory
    // so that if you're in it, you don't end up in trash.
    fs.emptyDirSync(outputPath);
  }

  const paths = Object.values(shopifyPaths);

  for (let i = 0; i < paths.length; i += 1) {
    const path = resolveAppPath(outputPath, paths[i]);

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }
}
