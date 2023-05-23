import { AsyncSeriesWaterfallHook } from 'tapable';
import { z } from 'zod';
import { Paths } from '../config/types';

export type Compiler = {
  input: string;
  output: string;
  hooks: Readonly<{
    beforeEmit: AsyncSeriesWaterfallHook<[File]>;
  }>;
};

export type File = {
  type: keyof Paths;
  sourcePath: string;
  targetPath: string;
  content: string;
};

export const plugin = z.object({
  apply: z.function().args(z.any()),
});

export type Plugin = {
  apply(compiler: Compiler): void;
};
