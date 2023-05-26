import { z } from 'zod';
import { plugin } from '../Plugin';
import { pathsPluginConfig } from '../plugins/PathsPlugin';
import { statsPluginConfig } from '../plugins/StatsPlugin';

export const baseCompilerConfig = z.object({
  /**
   * Where to look for files to compile.
   */
  input: z.string(),

  /**
   * Where to write the compiled files to. The emitter won't emit any assets if undefined.
   */
  output: z.string(),

  /**
   * A list of additional plugins to add to the compiler.
   */
  plugins: z.array(plugin),
});

export type BaseCompilerConfig = z.infer<typeof baseCompilerConfig>;

export const defaultBaseCompilerConfig: BaseCompilerConfig = {
  input: 'src',
  output: 'dist',
  plugins: [],
};

export const builtinPluginsConfig = z
  .object({})
  .merge(statsPluginConfig.deepPartial())
  .merge(pathsPluginConfig.deepPartial());

export const compilerConfig = baseCompilerConfig.merge(builtinPluginsConfig);

/**
 * Compiler configuration object.
 */
export type CompilerConfig = z.infer<typeof compilerConfig>;

export const melterConfig = compilerConfig.deepPartial();

/**
 * Melter configuration object.
 *
 * @see [Configuration documentation](https://github.com/unshopable/melter#configuration)
 */
export type MelterConfig = z.infer<typeof melterConfig>;
