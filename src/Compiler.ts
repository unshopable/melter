import { SyncHook } from 'tapable';
import { Compilation, CompilationStats } from './Compilation';
import { Emitter } from './Emitter';
import { Logger } from './Logger';
import { Watcher } from './Watcher';
import { CompilerConfig } from './config';

export type CompilerHooks = {
  beforeCompile: SyncHook<[]>;
  compilation: SyncHook<[Compilation]>;
  afterCompile: SyncHook<[Compilation]>;
  beforeEmit: SyncHook<[Compilation]>;
  emitter: SyncHook<[Emitter]>;
  afterEmit: SyncHook<[Compilation]>;
  done: SyncHook<[CompilationStats]>;

  watcherStart: SyncHook<[]>;
  watcherClose: SyncHook<[]>;
};

export type CompilerEvent = 'add' | 'update' | 'remove';

export class Compiler {
  cwd: Readonly<string>;
  config: Readonly<CompilerConfig>;

  hooks: Readonly<CompilerHooks>;

  watcher: Readonly<Watcher | null>;

  logger: Readonly<Logger>;

  constructor(config: CompilerConfig) {
    this.cwd = process.cwd();
    this.config = config;

    this.hooks = Object.freeze<CompilerHooks>({
      beforeCompile: new SyncHook(),
      compilation: new SyncHook(['compilation']),
      afterCompile: new SyncHook(['compilation']),
      beforeEmit: new SyncHook(['compilation']),
      emitter: new SyncHook(['emitter']),
      afterEmit: new SyncHook(['compilation']),
      done: new SyncHook(['stats']),

      watcherStart: new SyncHook(),
      watcherClose: new SyncHook(),
    });

    this.watcher = null;

    this.logger = new Logger();
  }

  build() {
    const watcher = new Watcher(this, this.config.input, {
      cwd: this.cwd,

      // Trigger build.
      ignoreInitial: false,

      // Do not listen for changes.
      persistent: false,
    });

    watcher.start();
  }

  watch() {
    this.watcher = new Watcher(this, this.config.input, {
      cwd: this.cwd,

      // Trigger an initial build.
      ignoreInitial: false,

      // Continously watch for changes.
      persistent: true,
    });

    this.watcher.start();
  }

  compile(event: CompilerEvent, assetPaths: Set<string>) {
    this.hooks.beforeCompile.call();

    const compilation = new Compilation(this, event, assetPaths);

    this.hooks.compilation.call(compilation);

    compilation.create();

    this.hooks.afterCompile.call(compilation);

    // If no output directory is specified we do not want to emit assets.
    if (this.config.output) {
      this.hooks.beforeEmit.call(compilation);

      const emitter = new Emitter(this, compilation);

      this.hooks.emitter.call(emitter);

      emitter.emit();

      this.hooks.afterEmit.call(compilation);
    }

    this.hooks.done.call(compilation.stats);
  }

  close() {
    if (this.watcher) {
      // Close active watcher if compiler has one.
      this.watcher.close();
    }

    process.exit();
  }

  addWarnings(message: string, warnings: string[]) {
    this.logger.error(message, warnings);
  }

  addErrors(message: string, errors: string[], { bail = false } = {}) {
    this.logger.error(message, errors);

    if (bail) {
      this.close();
    }
  }
}
