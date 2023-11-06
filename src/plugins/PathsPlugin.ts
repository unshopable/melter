import * as path from 'path';
import { Asset, AssetPath, AssetType } from '../Asset';
import { Compiler } from '../Compiler';
import { Emitter } from '../Emitter';
import { Plugin } from '../Plugin';
import { normalizePath } from '../utils';

type Paths = {
  /**
   * An array of paths pointing to files that should be processed as `assets`.
   */
  assets?: RegExp[];

  /**
   * An array of paths pointing to files that should be processed as `config`.
   */
  config?: RegExp[];

  /**
   * An array of paths pointing to files that should be processed as `layout`.
   */
  layout?: RegExp[];

  /**
   * An array of paths pointing to files that should be processed as `locales`.
   */
  locales?: RegExp[];

  /**
   * An array of paths pointing to files that should be processed as `sections`.
   */
  sections?: RegExp[];

  /**
   * An array of paths pointing to files that should be processed as `snippets`.
   */
  snippets?: RegExp[];

  /**
   * An array of paths pointing to files that should be processed as `templates`.
   */
  templates?: RegExp[];
};

/**
 * Path plugin configuration object.
 */
export type PathsPluginConfig = {
  /**
   * A map of Shopify's directory structure and component types.
   *
   * @see [Shopify Docs Reference](https://shopify.dev/docs/themes/architecture#directory-structure-and-component-types)
   */
  paths?: Paths | false;
};

const defaultPathsPluginConfig: PathsPluginConfig = {
  paths: {
    assets: [/assets\/[^\/]*\.*$/],
    config: [/config\/[^\/]*\.json$/],
    layout: [/layout\/[^\/]*\.liquid$/],
    locales: [/locales\/[^\/]*\.json$/],
    sections: [/sections\/[^\/]*\.liquid$/],
    snippets: [/snippets\/[^\/]*\.liquid$/],
    templates: [
      /templates\/[^\/]*\.liquid$/,
      /templates\/[^\/]*\.json$/,
      /templates\/customers\/[^\/]*\.liquid$/,
      /templates\/customers\/[^\/]*\.json$/,
    ],
  },
};

export class PathsPlugin extends Plugin {
  config: PathsPluginConfig;

  constructor(config: PathsPluginConfig) {
    super();

    this.config =
      config.paths !== false
        ? {
            paths: {
              ...defaultPathsPluginConfig.paths,
              ...config.paths,
            },
          }
        : {};
  }

  apply(compiler: Compiler): void {
    const output = compiler.config.output;

    if (!output) return;

    const paths = this.config.paths;

    if (!paths) return;

    compiler.hooks.compilation.tap('PathsPlugin', (compilation) => {
      compilation.hooks.afterAddAsset.tapPromise('PathsPlugin', async (asset: Asset) => {
        const assetType = this.determineAssetType(paths, asset.source.relative);

        if (!assetType) return;
        asset.type = assetType;

        const assetSourcePathParts = asset.source.relative.split(path.sep);

        let assetFilename: string = '';

        if (assetSourcePathParts.at(-2) === 'customers') {
          assetFilename = assetSourcePathParts.slice(-2).join(path.sep);
        } else {
          assetFilename = assetSourcePathParts.at(-1)!;
        }

        const assetTargetPath = this.resolveAssetTargetPath(
          compiler.cwd,
          output,
          assetType,
          assetFilename,
        );

        asset.target = assetTargetPath;
      });
    });
  }

  private determineAssetType(paths: Paths, assetPath: string): AssetType | null {
    const pathEntries = Object.entries(paths);
    const normalizedAssetPath = normalizePath(assetPath);

    for (let i = 0; i < pathEntries.length; i += 1) {
      const [name, patterns] = pathEntries[i];

      for (let j = 0; j < patterns.length; j++) {
        if (normalizedAssetPath.match(patterns[j])) {
          return name as AssetType;
        }
      }
    }

    return null;
  }

  private resolveAssetTargetPath(
    cwd: string,
    output: string,
    assetType: AssetType,
    filename: string,
  ): AssetPath {
    const relativeAssetTargetPath = path.resolve(output, assetType, filename);
    const absoluteAssetTargetPath = path.resolve(cwd, relativeAssetTargetPath);

    return {
      absolute: absoluteAssetTargetPath,
      relative: relativeAssetTargetPath,
    };
  }
}
