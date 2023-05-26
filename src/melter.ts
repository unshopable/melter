import { Compiler } from './Compiler';
import { MelterConfig } from './config';
import { applyConfigDefaults } from './config/defaults';

export function melter(config: MelterConfig) {
  const compilerConfig = applyConfigDefaults(config);
  const compiler = new Compiler(compilerConfig);

  if (Array.isArray(compilerConfig.plugins)) {
    for (const plugin of compilerConfig.plugins) {
      plugin.apply(compiler);
    }
  }

  return compiler;
}
