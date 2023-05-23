import Compiler from './compiler';
import { patchConfig } from './config';
import { Config } from './config/types';
import { MelterConfig } from './types';

function melter(config: MelterConfig) {
  const patchedConfig = patchConfig(config as Config);

  return new Compiler(patchedConfig);
}

export default melter;
