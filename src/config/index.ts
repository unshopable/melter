import { Plugin } from '../Plugin';
import { PathsPluginConfig } from '../plugins/PathsPlugin';
import { StatsPluginConfig } from '../plugins/StatsPlugin';

export * from './load';

export type BaseCompilerConfig = {
  /**
   * Where to look for files to compile.
   */
  input: string;

  /**
   * Where to write the compiled files to. The emitter won't emit any assets if undefined.
   */
  output: string;

  /**
   * A list of additional plugins to add to the compiler.
   */
  plugins: Plugin[];
};

export const defaultBaseCompilerConfig: BaseCompilerConfig = {
  input: 'src',
  output: 'dist',
  plugins: [],
};

/**
 * Compiler configuration object.
 */
export type CompilerConfig = {} & BaseCompilerConfig & StatsPluginConfig & PathsPluginConfig;

/**
 * Melter configuration object.
 *
 * @see [Configuration documentation](https://github.com/unshopable/melter#configuration)
 */
export type MelterConfig = Partial<CompilerConfig>;
