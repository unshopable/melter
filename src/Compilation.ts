import path from 'path';
import { SyncHook } from 'tapable';
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
  beforeAddAsset: SyncHook<[Asset]>;
  afterAddAsset: SyncHook<[Asset]>;
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
      beforeAddAsset: new SyncHook(['asset']),
      afterAddAsset: new SyncHook(['asset']),
    });
  }

  create() {
    const startTime = performance.now();

    this.assetPaths.forEach((assetPath) => {
      const assetType = 'sections';

      const sourcePath = {
        absolute: path.resolve(this.compiler.cwd, assetPath),
        relative: assetPath,
      };

      const asset = new Asset(assetType, sourcePath, new Set(), this.event);

      this.hooks.beforeAddAsset.call(asset);

      this.assets.add(asset);
      this.stats.assets.push(asset);

      this.hooks.afterAddAsset.call(asset);
    });

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
