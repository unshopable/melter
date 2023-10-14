import * as path from 'path';
import { AsyncSeriesHook } from 'tapable';
import { Asset } from './Asset';
import { Compiler, CompilerEvent } from './Compiler';

export type CompilationStats = {
  /**
   * The compilation time in milliseconds.
   */
  time: number;

  /**
   * A list of asset objects.
   */
  assets: Asset[];

  /**
   * A list of warnings.
   */
  warnings: string[];

  /**
   * A list of errors.
   */
  errors: string[];
};

export type CompilationHooks = {
  beforeAddAsset: AsyncSeriesHook<[Asset]>;
  afterAddAsset: AsyncSeriesHook<[Asset]>;
};

export class Compilation {
  compiler: Compiler;
  event: CompilerEvent;
  assetPaths: Set<string>;
  assets: Set<Asset>;

  stats: CompilationStats;

  hooks: Readonly<CompilationHooks>;

  /**
   * Creates an instance of `Compilation`.
   *
   * @param compiler The compiler which created the compilation.
   * @param assetPaths A set of paths to assets that should be compiled.
   */
  constructor(compiler: Compiler, event: CompilerEvent, assetPaths: Set<string>) {
    this.compiler = compiler;
    this.event = event;
    this.assetPaths = assetPaths;
    this.assets = new Set<Asset>();

    this.stats = {
      time: 0,

      assets: [],

      warnings: [],
      errors: [],
    };

    this.hooks = Object.freeze<CompilationHooks>({
      beforeAddAsset: new AsyncSeriesHook(['asset']), // Use AsyncSeriesHook
      afterAddAsset: new AsyncSeriesHook(['asset']),  // Use AsyncSeriesHook
    });
  }

  async create() {
    const startTime = performance.now();

    const promises = Array.from(this.assetPaths).map(async (assetPath) => {
      const assetType = 'unknown';

      const sourcePath = {
        absolute: path.resolve(this.compiler.cwd, assetPath),
        relative: assetPath,
      };

      const asset = new Asset(assetType, sourcePath, new Set(), this.event);

      await this.hooks.beforeAddAsset.promise(asset); // Use .promise() for Async hooks

      this.assets.add(asset);
      this.stats.assets.push(asset);

      await this.hooks.afterAddAsset.promise(asset); // Use .promise() for Async hooks
    });

    await Promise.all(promises);

    const endTime = performance.now();

    this.stats.time = Number((endTime - startTime).toFixed(2));
  }

  addWarning(warning: string) {
    this.stats.warnings.push(warning);
  }

  addError(error: string) {
    this.stats.errors.push(error);
  }
}
