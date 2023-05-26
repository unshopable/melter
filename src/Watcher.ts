import chokidar from 'chokidar';
import fs from 'fs';
import { Compiler } from './Compiler';

interface WatchOptions extends chokidar.WatchOptions {}

export class Watcher {
  compiler: Compiler;

  watcher: chokidar.FSWatcher | null;
  watcherPath: string;
  watchOptions: WatchOptions;

  initial: boolean;
  initialAssetPaths: Set<string>;

  constructor(compiler: Compiler, watcherPath: string, watchOptions: WatchOptions) {
    this.compiler = compiler;

    this.watcher = null;
    this.watcherPath = watcherPath;
    this.watchOptions = watchOptions;

    this.initial = true;
    this.initialAssetPaths = new Set<string>();
  }

  start() {
    if (this.watchOptions.persistent) {
      // Chokidar is not really watching without `persistent` being `true` so we do not want
      // to call the `watcherStart` hook in this case.
      this.compiler.hooks.watcherStart.call();
    }

    this.watcher = chokidar.watch(this.watcherPath, this.watchOptions);

    this.watcher.on('add', (path: string, stats: fs.Stats) => {
      if (this.initial) {
        this.initialAssetPaths.add(path);

        return;
      }

      this.compiler.compile('add', new Set([path]));
    });

    this.watcher.on('change', (path: string, stats: fs.Stats) => {
      this.compiler.compile('update', new Set([path]));
    });

    this.watcher.on('unlink', (path: string, stats: fs.Stats) => {
      this.compiler.compile('remove', new Set([path]));
    });

    this.watcher.on('ready', () => {
      this.initial = false;

      this.compiler.compile('add', this.initialAssetPaths);
    });
  }

  async close() {
    if (this.watcher) {
      await this.watcher.close();

      this.compiler.hooks.watcherClose.call();
    }
  }
}
