import { z } from 'zod';
import { CompilationStats } from '../Compilation';
import { Compiler } from '../Compiler';
import { Plugin } from '../Plugin';

export const statsPluginConfig = z.object({
  stats: z.boolean().optional(),
});

export type StatsPluginConfig = z.infer<typeof statsPluginConfig>;

export class StatsPlugin extends Plugin {
  config: StatsPluginConfig;
  shouldApply: boolean;

  constructor(config: StatsPluginConfig = {}) {
    super();

    this.config = config;
    this.shouldApply = config.stats !== false;
  }

  apply(compiler: Compiler): void {
    if (!this.shouldApply) return;

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
