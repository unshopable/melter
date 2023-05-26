import get from 'lodash.get';
import set from 'lodash.set';
import { CompilerConfig, MelterConfig, baseCompilerConfig, defaultBaseCompilerConfig } from '.';
import { PathsPlugin } from '../plugins/PathsPlugin';
import { StatsPlugin } from '../plugins/StatsPlugin';

function applyDefaultPlugins(config: CompilerConfig) {
  config.plugins.push(
    ...[
      new StatsPlugin({
        stats: config.stats,
      }),

      new PathsPlugin({
        paths: config.paths,
      }),
    ],
  );

  return config;
}

function patchMelterConfig(config: MelterConfig): CompilerConfig {
  // Only validate base compiler config. Each plugin handles its own validation.
  const result = baseCompilerConfig.safeParse(config);

  if (result.success) return result.data;

  const patchedCompilerConfig = { ...config };

  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    const defaultValue = get(defaultBaseCompilerConfig, path);

    set(patchedCompilerConfig, path, defaultValue);
  });

  return patchedCompilerConfig as CompilerConfig;
}

export function applyConfigDefaults(config: MelterConfig): CompilerConfig {
  const compilerConfig = patchMelterConfig(config);

  applyDefaultPlugins(compilerConfig);

  return compilerConfig;
}
