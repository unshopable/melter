import fg from 'fast-glob';
import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseCompilerConfig, MelterConfig, defaultBaseCompilerConfig } from '.';
import { getFilenameFromPath, parseJSON } from '../utils';

function getConfigFiles(cwd: string): string[] {
  const configFilePattern = 'melter.config.*';

  return fg.sync(fg.convertPathToPattern(path.join(cwd, configFilePattern)));
}

function parseConfigFile(file: string): { config: MelterConfig | null; errors: string[] } {
  if (file.endsWith('json')) {
    const content = fs.readFileSync(file, 'utf8');

    const { data, error } = parseJSON<MelterConfig>(content);

    if (error) {
      return {
        config: null,
        errors: [error],
      };
    }

    return {
      config: data,
      errors: [],
    };
  }

  return {
    config: require(file).default || require(file),
    errors: [],
  };
}

export function loadConfig(): {
  config: MelterConfig | BaseCompilerConfig | null;
  warnings: string[];
  errors: string[];
} {
  const configFiles = getConfigFiles(process.cwd());

  if (configFiles.length === 0) {
    return {
      config: defaultBaseCompilerConfig,
      warnings: [
        'No config found. Loaded default config. To disable this warning create a custom config.',
      ],
      errors: [],
    };
  }

  const firstConfigFile = configFiles[0];

  const warnings: string[] = [];

  if (configFiles.length > 1) {
    warnings.push(
      `Multiple configs found. Loaded '${getFilenameFromPath(
        firstConfigFile,
      )}'. To disable this warning remove unused configs.`,
    );
  }

  const { config, errors } = parseConfigFile(firstConfigFile);

  return {
    config,
    warnings,
    errors,
  };
}
