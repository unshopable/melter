import { CompilerConfig, MelterConfig, defaultBaseCompilerConfig } from '.';
import { Plugin } from '../Plugin';
import { PathsPlugin } from '../plugins/PathsPlugin';
import { StatsPlugin } from '../plugins/StatsPlugin';

function applyDefaultPlugins(config: CompilerConfig): Plugin[] {
  const plugins = [];

  plugins.push(
    ...[
      new StatsPlugin({
        stats: config.stats,
      }),

      new PathsPlugin({
        paths: config.paths,
      }),
    ],
  );

  return plugins;
}

export function applyConfigDefaults(config: MelterConfig): CompilerConfig {
  const compilerConfig = {
    ...defaultBaseCompilerConfig,
    ...config,
  };

  compilerConfig.plugins = [...applyDefaultPlugins(compilerConfig), ...compilerConfig.plugins];

  return compilerConfig;
}
