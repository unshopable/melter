import fs from 'fs-extra';
import { AsyncSeriesWaterfallHook } from 'tapable';
import { Config, Paths } from '../config/types';
import logger from '../logger';
import Watcher from '../watcher';
import { WatcherWarning } from '../watcher/types';
import { File } from './types';
import { resolveAppPath, setupOutputDirectory } from './utils';

type ShopifyPath = keyof Paths;

function formatWatcherWarnings(warnings: WatcherWarning[]): string {
  return warnings.map(({ path, message }) => `${path}:\n  - ${message}`).join('\n\n');
}

export default class Compiler {
  private config: Config;
  private hooks: Readonly<{
    beforeEmit: AsyncSeriesWaterfallHook<[File]>;
  }>;

  private watcher: Watcher | null;

  constructor(config: Config) {
    this.config = config;

    this.hooks = Object.freeze({
      beforeEmit: new AsyncSeriesWaterfallHook<[File]>(['file']),
    });

    this.watcher = null;

    this.applyPlugins();

    setupOutputDirectory(this.config.output, this.config.clean);

    if (this.config.watch) {
      this.startWatch();
    }
  }

  // Public API.

  build() {
    this.startBuild();
  }

  watch() {
    this.startWatch();
  }

  // Private API.

  private applyPlugins() {
    this.config.plugins.forEach((plugin) => plugin.apply(this));
  }

  private startBuild() {
    this.watcher = new Watcher(this.config.input, this.config.paths);

    let start: number = 0;
    let end: number = 0;
    let warnings: WatcherWarning[] = [];

    this.watcher.on('started', () => {
      start = performance.now();
    });

    this.watcher.on('finished', () => {
      end = performance.now();

      if (warnings.length === 0) {
        logger.build.success(`Successfully compiled in ${Math.round(end - start)} ms`);
      } else {
        logger.build.warning('Compiled with warnings.\n');
        console.log(formatWatcherWarnings(warnings));
      }
    });

    this.watcher.on('warning', (warning: WatcherWarning) => {
      warnings.push(warning);
    });

    this.watcher.on('error', (error: string) => {
      logger.error(error);

      process.exit();
    });

    this.watcher.on('addFile', async (type: ShopifyPath, path: string, filename: string) => {
      await this.writeFile(type, path, filename);
    });

    this.watcher.start();
  }

  private startWatch() {
    this.watcher = new Watcher(this.config.input, this.config.paths, {
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher.on('ready', () => {
      logger.ready(`Started watching ${this.config.input}\n`);
    });

    this.watcher.on('warning', (warning: WatcherWarning) => {
      logger.warning(warning.message);
    });

    this.watcher.on('error', (error: string) => {
      logger.error(error);
    });

    this.watcher.on('addFile', async (type: ShopifyPath, path: string, filename: string) => {
      logger.wait('Compiling...');

      await this.writeFile(type, path, filename);

      logger.event(`Added ${type}/${filename}`);
    });

    this.watcher.on('updateFile', async (type: ShopifyPath, path: string, filename: string) => {
      logger.wait('Compiling...');

      await this.writeFile(type, path, filename);

      logger.event(`Updated ${type}/${filename}`);
    });

    this.watcher.on('removeFile', async (type: ShopifyPath, path: string, filename: string) => {
      logger.wait('Compiling...');

      await this.deleteFile(type, path, filename);

      logger.event(`Deleted ${type}/${filename}`);
    });

    this.watcher.start();
  }

  private async writeFile(type: ShopifyPath, relativeSourcePath: string, fileName: string) {
    const sourcePath = resolveAppPath(this.config.input, relativeSourcePath);
    const content = await fs.readFile(sourcePath, 'utf8');
    const targetPath = resolveAppPath(this.config.output, type, fileName);

    this.hooks.beforeEmit.callAsync(
      {
        type,
        sourcePath,
        targetPath,
        content,
      },
      async (error, result) => {
        if (result) {
          await fs.writeFile(result.targetPath, result.content);
        } else {
          // TODO: We should probably handle this case better than just falling back.
          await fs.writeFile(targetPath, content);
        }
      },
    );
  }

  private async deleteFile(type: ShopifyPath, path: string, fileName: string) {
    const targetPathWithFilename = resolveAppPath(this.config.output, type, fileName);

    await fs.remove(targetPathWithFilename);
  }
}

export * from './types';
