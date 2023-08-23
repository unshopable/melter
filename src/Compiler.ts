import { AsyncParallelHook } from 'tapable';
import { Compilation, CompilationStats } from './Compilation';
import { Emitter } from './Emitter';
import { Logger } from './Logger';
import { Watcher } from './Watcher';
import { CompilerConfig } from './config';

export type CompilerHooks = {
  beforeCompile: AsyncParallelHook<[]>;
  compilation: AsyncParallelHook<[Compilation]>;
  afterCompile: AsyncParallelHook<[Compilation]>;
  beforeEmit: AsyncParallelHook<[Compilation]>;
  emitter: AsyncParallelHook<[Emitter]>;
  afterEmit: AsyncParallelHook<[Compilation]>;
  done: AsyncParallelHook<[CompilationStats]>;

  watcherStart: AsyncParallelHook<[]>;
  watcherClose: AsyncParallelHook<[]>;
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
      beforeCompile: new AsyncParallelHook(),
      compilation: new AsyncParallelHook(['compilation']),
      afterCompile: new AsyncParallelHook(['compilation']),
      beforeEmit: new AsyncParallelHook(['compilation']),
      emitter: new AsyncParallelHook(['emitter']),
      afterEmit: new AsyncParallelHook(['compilation']),
      done: new AsyncParallelHook(['stats']),

      watcherStart: new AsyncParallelHook(),
      watcherClose: new AsyncParallelHook(),
    });

    this.watcher = null;

    this.logger = new Logger();
  }

  async build() {
    await this.hooks.beforeCompile.promise();

    const watcher = new Watcher(this, this.config.input, {
      cwd: this.cwd,

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

    await this.hooks.compilation.callAsync(compilation);

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
