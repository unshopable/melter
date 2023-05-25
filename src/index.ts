import Compiler from './compiler';
import { patchConfig } from './config';
import { Config } from './config/types';
import { MelterConfig } from './types';

export function melter(config: MelterConfig) {
  const patchedConfig = patchConfig(config as Config);

  return new Compiler(patchedConfig);
}

export type * from './compiler';
export type * from './types';
