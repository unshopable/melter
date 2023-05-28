import * as fs from 'fs-extra';
import { CompilerEvent } from './Compiler';

export type AssetType =
  | 'assets'
  | 'config'
  | 'layout'
  | 'locales'
  | 'sections'
  | 'snippets'
  | 'templates';

export type AssetPath = {
  absolute: string;
  relative: string;
};

export class Asset {
  /**
   * The type of the asset.
   */
  type: AssetType;

  /**
   * The absolute and relative path to the asset's file.
   */
  source: AssetPath;

  /**
   * The absolute and relative path to the asset's file.
   */
  target?: AssetPath;

  /**
   * A set of assets the asset is linked with.
   */
  links: Set<Asset>;

  /**
   * The asset's content.
   */
  content: Buffer;

  /**
   * The action that created this asset.
   */
  action: CompilerEvent;

  constructor(type: AssetType, source: AssetPath, links: Set<Asset>, action: CompilerEvent) {
    this.type = type;
    this.source = source;
    this.links = new Set<Asset>(links);

    this.content = this.getContent();

    this.action = action;
  }

  private getContent() {
    try {
      return fs.readFileSync(this.source.absolute);
    } catch {
      return Buffer.from('');
    }
  }
}
