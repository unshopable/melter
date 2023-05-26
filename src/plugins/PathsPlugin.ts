import path from 'path';
import { z } from 'zod';
import { Asset, AssetPath, AssetType } from '../Asset';
import { Compiler } from '../Compiler';
import { Emitter } from '../Emitter';
import { Plugin } from '../Plugin';
import { Entries } from '../types/util';
import { formatZodIssues } from '../utils/zod';

export const pathPattern = z.custom<RegExp>(
  (value) => {
    return value instanceof RegExp;
  },
  { message: "Property '%path' expected RegExp" },
);

/**
 * A map of Shopify's directory structure and component types.
 *
 * @see [Shopify Docs Reference](https://shopify.dev/docs/themes/architecture#directory-structure-and-component-types)
 */
export const paths = z.object({
  /**
   * An array of paths pointing to files that should be processed as `assets`.
   */
  assets: z
    .array(pathPattern)
    .nonempty({ message: "Property '%path' expected at least %minimum element(s)" }),

  /**
   * An array of paths pointing to files that should be processed as `config`.
   */
  config: z
    .array(pathPattern)
    .nonempty({ message: "Property '%path' expected at least %minimum element(s)" }),

  /**
   * An array of paths pointing to files that should be processed as `layout`.
   */
  layout: z
    .array(pathPattern)
    .nonempty({ message: "Property '%path' expected at least %minimum element(s)" }),

  /**
   * An array of paths pointing to files that should be processed as `locales`.
   */
  locales: z
    .array(pathPattern)
    .nonempty({ message: "Property '%path' expected at least %minimum element(s)" }),

  /**
   * An array of paths pointing to files that should be processed as `sections`.
   */
  sections: z
    .array(pathPattern)
    .nonempty({ message: "Property '%path' expected at least %minimum element(s)" }),

  /**
   * An array of paths pointing to files that should be processed as `snippets`.
   */
  snippets: z
    .array(pathPattern)
    .nonempty({ message: "Property '%path' expected at least %minimum element(s)" }),

  /**
   * An array of paths pointing to files that should be processed as `templates`.
   */
  templates: z
    .array(pathPattern)
    .nonempty({ message: "Property '%path' expected at least %minimum element(s)" }),
});

export type Paths = z.infer<typeof paths>;

export const pathsPluginConfig = z.object({
  paths,
});

export type PathsPluginConfig = z.infer<typeof pathsPluginConfig>;

export const deepPartialPluginConfig = pathsPluginConfig.deepPartial();

export type DeepPartialPathsPluginConfig = z.infer<typeof deepPartialPluginConfig>;

export const defaultPathsPluginConfig: PathsPluginConfig = {
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
  shouldApply: boolean;

  constructor(config: DeepPartialPathsPluginConfig = {}) {
    super();

    this.config = {
      paths: {
        ...defaultPathsPluginConfig.paths,
        ...config.paths,
      },
    };

    this.shouldApply = Object.keys(this.config.paths).length > 0;
  }

  apply(compiler: Compiler): void {
    const output = compiler.config.output;

    if (!output) return;

    if (!this.shouldApply) return;

    this.validateConfig(compiler);

    compiler.hooks.emitter.tap('PathsPlugin', (emitter: Emitter) => {
      emitter.hooks.beforeAssetAction.tap('PathsPlugin', (asset: Asset) => {
        const assetType = this.determineAssetType(asset.source.relative);

        if (!assetType) return;

        const assetSourcePathParts = asset.source.relative.split('/');

        let assetFilename: string = '';

        if (assetSourcePathParts.at(-2) === 'customers') {
          assetFilename = assetSourcePathParts.slice(-2).join('/');
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

  private validateConfig(compiler: Compiler) {
    const result = pathsPluginConfig.safeParse(this.config);

    if (!result.success) {
      compiler.addErrors('ConfigError', formatZodIssues(result.error.issues), {
        bail: true,
      });
    }
  }

  private determineAssetType(assetPath: string): AssetType | null {
    const pathEntries = Object.entries(this.config.paths) as Entries<PathsPluginConfig['paths']>;

    for (let i = 0; i < pathEntries.length; i += 1) {
      const [name, patterns] = pathEntries[i];

      for (let j = 0; j < patterns.length; j++) {
        if (assetPath.match(patterns[j])) {
          return name;
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
