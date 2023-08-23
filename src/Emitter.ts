import * as fs from 'fs-extra';
import { AsyncParallelHook } from 'tapable'; // Import AsyncParallelHook
import { Asset, AssetPath } from './Asset';
import { Compilation } from './Compilation';
import { Compiler } from './Compiler';

export type EmitterHooks = Readonly<{
  beforeAssetAction: AsyncParallelHook<[Asset]>; // Change to AsyncParallelHook
  afterAssetAction: AsyncParallelHook<[Asset]>; // Change to AsyncParallelHook
}>;

export class Emitter {
  compiler: Compiler;
  compilation: Compilation;

  hooks: EmitterHooks;

  constructor(compiler: Compiler, compilation: Compilation) {
    this.compiler = compiler;
    this.compilation = compilation;

    this.hooks = {
      beforeAssetAction: new AsyncParallelHook(['asset']), // Change to AsyncParallelHook
      afterAssetAction: new AsyncParallelHook(['asset']), // Change to AsyncParallelHook
    };
  }

  async emit() { // Change the method to be asynchronous
    for (const asset of this.compilation.assets) {
      await this.hooks.beforeAssetAction.promise(asset); // Use .promise() for Async hooks

      if (typeof asset.target === 'undefined') {
        this.compilation.addWarning(`Missing target path: '${asset.source.relative}'`);
        continue;
      }

      switch (asset.action) {
        case 'add':
        case 'update': {
          await this.writeFile(asset.target.absolute, asset.content); // Await the asynchronous method

          break;
        }

        case 'remove': {
          await this.removeFile(asset.target.absolute); // Await the asynchronous method

          break;
        }
      }

      await this.hooks.afterAssetAction.promise(asset); // Use .promise() for Async hooks
    }
  }

  private async writeFile(targetPath: AssetPath['absolute'], content: Asset['content']) {
    try {
      await fs.ensureFile(targetPath);
      await fs.writeFile(targetPath, content);
    } catch (error: any) {
      this.compilation.addError(error.message);
    }
  }

  private async removeFile(targetPath: AssetPath['absolute']) {
    try {
      await fs.remove(targetPath);
    } catch (error: any) {
      this.compilation.addError(error.message);
    }
  }
}
