import chokidar, { FSWatcher } from 'chokidar';
import { Stats } from 'fs';
import path from 'path';
import { Entries } from '../../types';
import { Config, Paths } from '../config/types';
import { getFilenameFromPath } from '../utils/utils';
import { WatcherEvent, WatcherListener, WatcherOptions } from './types';

type ShopifyPath = keyof Paths;

const defaultWatcherOptions: Omit<WatcherOptions, 'cwd'> = {
  ignoreInitial: false,
  persistent: false,
  usePolling: true,
  interval: 100,
  binaryInterval: 100,
};

export default class Watcher {
  input: string;
  paths: Paths;
  options: WatcherOptions;
  watcher: FSWatcher | null;
  listeners: {
    [k in WatcherEvent]?: WatcherListener[];
  };

  fileCache: Map<string, string>;

  constructor(input: string, paths: Paths, options: Partial<Omit<WatcherOptions, 'cwd'>> = {}) {
    this.input = input;
    this.paths = paths;

    this.options = {
      ...defaultWatcherOptions,
      ...options,

      cwd: path.join(process.cwd(), this.input),
    };

    this.watcher = null;
    this.listeners = {};

    this.fileCache = new Map();
  }

  async start() {
    this.watcher = chokidar.watch('', this.options);

    this.emit('started');

    this.watcher.on('ready', this.handleReady.bind(this));
    this.watcher.on('error', this.handleError.bind(this));

    this.watcher.on('add', this.handleFileAdd.bind(this));
    this.watcher.on('change', this.handleFileUpdate.bind(this));
    this.watcher.on('unlink', this.handleFileRemove.bind(this));
  }

  emit(event: WatcherEvent, ...data: any[]) {
    this.listeners[event]?.forEach((cb) => cb(...data));
  }

  on(event: WatcherEvent, cb: (...data: any[]) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];

    // TODO: Fix this
    // @ts-ignore
    this.listeners[event].push(cb);
  }

  private handleReady() {
    this.emit('ready');

    process.on('exit', () => this.emit('finished'));
  }

  private handleError(error: Error) {
    this.emit('error', error);
  }

  private handleFileAdd(path: string, stats?: Stats | undefined) {
    const match = this.matchFile(path);

    if (match) {
      const filename = getFilenameFromPath(path);

      // Check if file with the same type and name already exists and emit a warning if true.
      const existingFile = this.getCachedFile(match, filename);

      if (!!existingFile) {
        this.emit('warning', {
          path,
          message: `File '${filename}' of type '${match}' already exists in '${existingFile}'`,
        });
      } else {
        this.setCachedFile(match, filename, path);

        this.emit('addFile', match, path, filename);
      }
    }
  }

  private async handleFileUpdate(path: string, stats?: Stats | undefined) {
    const match = this.matchFile(path);

    if (match) {
      const filename = getFilenameFromPath(path);

      // Check if file with the same type and name already exists and emit a warning if true.
      const existingFile = this.getCachedFile(match, filename);

      if (!!existingFile) {
        this.emit('warning', {
          path,
          message: `File '${filename}' of type '${match}' already exists in '${existingFile}'`,
        });
      } else {
        this.setCachedFile(match, filename, path);

        this.emit('updateFile', match, path, getFilenameFromPath(path));
      }
    }
  }

  private handleFileRemove(path: string, stats?: Stats | undefined) {
    const match = this.matchFile(path);

    if (match) {
      const filename = getFilenameFromPath(path);

      // Check if file exists in cache and remove it if true.
      const existingFile = this.getCachedFile(match, filename);

      if (existingFile === path) {
        this.deleteCachedFile(match, filename);
      }

      this.emit('removeFile', match, path, filename);
    }
  }

  private matchFile(path: string): ShopifyPath | null {
    const paths = Object.entries(this.paths) as Entries<Config['paths']>;

    for (let i = 0; i < paths.length; i += 1) {
      const [name, patterns] = paths[i];

      for (let j = 0; j < patterns.length; j++) {
        const regex = new RegExp(patterns[j]);

        if (path.match(regex)) {
          return name;
        }
      }
    }

    return null;
  }

  private getCachedFile(type: ShopifyPath, filename: string) {
    return this.fileCache.get(this.generateFileCacheKey(type, filename));
  }

  private setCachedFile(type: ShopifyPath, filename: string, path: string) {
    return this.fileCache.set(this.generateFileCacheKey(type, filename), path);
  }

  private deleteCachedFile(type: ShopifyPath, filename: string) {
    this.fileCache.delete(this.generateFileCacheKey(type, filename));
  }

  private generateFileCacheKey(type: ShopifyPath, filename: string): string {
    return `${type}:${filename}`;
  }
}
