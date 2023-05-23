import fg from 'fast-glob';
import fs from 'fs-extra';
import get from 'lodash.get';
import set from 'lodash.set';
import path from 'path';
import logger from '../logger';
import { getFilenameFromPath, parseJSON } from '../utils/utils';
import { formatZodIssues } from '../utils/zod';
import { Config, Paths, config } from './types';

const defaultsPaths: Paths = {
  assets: ['assets/[^/]+\\.*'],
  config: ['config/[^/]+\\.json'],
  layout: ['layout/[^/]+\\.liquid'],
  locales: ['locales/[^/]+\\.json'],
  sections: ['sections/[^/]+\\.liquid'],
  snippets: ['snippets/[^/]+\\.liquid'],
  templates: ['templates/[^/]+\\.liquid', 'sections/[^/]+\\.json'],
};

export const defaultConfig: Config = {
  input: 'src',
  output: 'dist',

  clean: true,

  watch: false,

  paths: defaultsPaths,

  plugins: [],
};

async function getConfigFiles(cwd: string): Promise<string[]> {
  const configFilePattern = 'melter.config.*';

  return await fg(path.join(cwd, configFilePattern));
}

async function parseConfigFile(file: string): Promise<{ config: Config | null; errors: string[] }> {
  let userConfig: Config | null = null;

  if (file.endsWith('json')) {
    const content = await fs.readFile(file, 'utf8');

    const { data, error } = parseJSON<Config>(content);

    if (error) {
      return {
        config: null,
        errors: [error],
      };
    }

    userConfig = data;
  } else {
    userConfig = require(file).default;
  }

  // We don't expect the config to define every single option.
  const result = await config.deepPartial().safeParseAsync(userConfig);

  if (result.success) {
    return {
      config: userConfig,
      errors: [],
    };
  }

  return {
    config: null,
    errors: formatZodIssues(result.error.issues),
  };
}

export function patchConfig(userConfig: Config): Config {
  const result = config.safeParse(userConfig);

  if (result.success) return result.data;

  const patchedUserConfig = { ...userConfig };

  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    const defaultValue = get(defaultConfig, path);

    set(patchedUserConfig, path, defaultValue);
  });

  return patchedUserConfig as Config;
}

export default async function loadConfig(): Promise<Config> {
  const configFiles = await getConfigFiles(process.cwd());

  if (configFiles.length === 0) {
    logger.warning('No config found. Loading default config...');

    return defaultConfig;
  }

  const firstConfigFile = configFiles[0];

  if (configFiles.length > 1) {
    logger.warning(`Multiple configs found. Loading ${getFilenameFromPath(firstConfigFile)}...`);
  }

  const { config: userConfig, errors } = await parseConfigFile(firstConfigFile);

  if (!userConfig) {
    logger.error(errors);

    process.exit();
  }

  return patchConfig(userConfig);
}
