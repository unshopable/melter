import { AsyncSeriesHook } from 'tapable';
import { Compilation, CompilationStats } from './Compilation';
import { Emitter } from './Emitter';
import { Logger } from './Logger';
import { Watcher } from './Watcher';
import { CompilerConfig } from './config';

export type CompilerHooks = {
  beforeCompile: AsyncSeriesHook<[]>;
  compilation: AsyncSeriesHook<[Compilation]>;
  afterCompile: AsyncSeriesHook<[Compilation]>;
  beforeEmit: AsyncSeriesHook<[Compilation]>;
  emitter: AsyncSeriesHook<[Emitter]>;
  afterEmit: AsyncSeriesHook<[Compilation]>;
  done: AsyncSeriesHook<[CompilationStats]>;

  watcherStart: AsyncSeriesHook<[]>;
  watcherClose: AsyncSeriesHook<[]>;
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
      beforeCompile: new AsyncSeriesHook(),
      compilation: new AsyncSeriesHook(['compilation']),
      afterCompile: new AsyncSeriesHook(['compilation']),
      beforeEmit: new AsyncSeriesHook(['compilation']),
      emitter: new AsyncSeriesHook(['emitter']),
      afterEmit: new AsyncSeriesHook(['compilation']),
      done: new AsyncSeriesHook(['stats']),

      watcherStart: new AsyncSeriesHook(),
      watcherClose: new AsyncSeriesHook(),
    });

    this.watcher = null;

    this.logger = new Logger();
  }

  async build() {
    await this.hooks.beforeCompile.promise();

    const watcher = new Watcher(this, this.config.input, {
      cwd: this.cwd,

      ignored: this.config.ignored,

      // Trigger build.
      ignoreInitial: false,

      // Do not listen for changes.
      persistent: false,
    });

    await this.hooks.watcherStart.promise(); 
    watcher.start();
    await this.hooks.watcherClose.promise(); 
  }

  async watch() {
    this.watcher = new Watcher(this, this.config.input, {
      cwd: this.cwd,

      ignored: this.config.ignored,

      // Trigger an initial build.
      ignoreInitial: false,

      // Continously watch for changes.
      persistent: true,
    });

    await this.hooks.watcherStart.promise(); 
    this.watcher.start();
    await this.hooks.watcherClose.promise(); 
  }

  async compile(event: CompilerEvent, assetPaths: Set<string>) {
    await this.hooks.beforeCompile.promise();

    const compilation = new Compilation(this, event, assetPaths);

    await this.hooks.compilation.promise(compilation);

    compilation.create();

    await this.hooks.afterCompile.promise(compilation);

    // If no output directory is specified we do not want to emit assets.
    if (this.config.output) {
      await this.hooks.beforeEmit.promise(compilation);

      const emitter = new Emitter(this, compilation);

      await this.hooks.emitter.promise(emitter);

      emitter.emit();

      await this.hooks.afterEmit.promise(compilation);
    }

    await this.hooks.done.promise(compilation.stats);
  }

  async close() {
    if (this.watcher) {
      // Close active watcher if compiler has one.
      await this.hooks.watcherClose.promise();

      this.watcher.close();
    }

    process.exit();
  }
}
