import fs from 'fs-extra';
import { SyncHook } from 'tapable';
import { Asset, AssetPath } from './Asset';
import { Compilation } from './Compilation';
import { Compiler } from './Compiler';

export type EmitterHooks = Readonly<{
  beforeAssetAction: SyncHook<[Asset]>;
  afterAssetAction: SyncHook<[Asset]>;
}>;

export class Emitter {
  compiler: Compiler;
  compilation: Compilation;

  hooks: EmitterHooks;

  constructor(compiler: Compiler, compilation: Compilation) {
    this.compiler = compiler;
    this.compilation = compilation;

    this.hooks = {
      beforeAssetAction: new SyncHook(['asset']),
      afterAssetAction: new SyncHook(['asset']),
    };
  }

  emit() {
    this.compilation.assets.forEach((asset) => {
      this.hooks.beforeAssetAction.call(asset);

      if (typeof asset.target === 'undefined') {
        this.compilation.addWarning(`Missing target path: '${asset.source.relative}'`);

        return;
      }

      switch (asset.action) {
        case 'add':
        case 'update': {
          this.writeFile(asset.target.absolute, asset.content);

          break;
        }

        case 'remove': {
          this.removeFile(asset.target.absolute);

          break;
        }

        // No default.
      }

      this.hooks.afterAssetAction.call(asset);
    });
  }

  private writeFile(targetPath: AssetPath['absolute'], content: Asset['content']) {
    try {
      fs.ensureFileSync(targetPath);
      fs.writeFileSync(targetPath, content);
    } catch (error: any) {
      this.compilation.addError(error.message);
    }
  }

  private removeFile(targetPath: AssetPath['absolute']) {
    try {
      fs.removeSync(targetPath);
    } catch (error: any) {
      this.compilation.addError(error.message);
    }
  }
}
