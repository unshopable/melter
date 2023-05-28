import { CompilationStats } from '../Compilation';
import { Compiler } from '../Compiler';
import { Plugin } from '../Plugin';

export type StatsPluginConfig = {
  stats?: boolean;
};

export class StatsPlugin extends Plugin {
  config: StatsPluginConfig;

  constructor(config: StatsPluginConfig = {}) {
    super();

    this.config = config;
  }

  apply(compiler: Compiler): void {
    if (this.config.stats === false) return;

    compiler.hooks.done.tap('StatsPlugin', (compilationStats: CompilationStats) => {
      if (compilationStats.errors.length > 0) {
        compiler.logger.error('Compilation failed', compilationStats.errors);
      } else if (compilationStats.warnings.length > 0) {
        compiler.logger.warning(
          `Compiled with ${compilationStats.warnings.length} warnings`,
          compilationStats.warnings,
        );
      } else {
        compiler.logger.success(`Successfully compiled in ${compilationStats.time} ms`);
      }
    });
  }
}
