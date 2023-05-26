import { z } from 'zod';
import { Compiler } from './Compiler';

export const plugin = z.object({
  apply: z.function().args(z.any()).returns(z.void()),
});

export class Plugin {
  apply(compiler: Compiler): void {}
}
