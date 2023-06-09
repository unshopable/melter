import type { Options } from 'tsup';

const tsupConfig: Options = {
  entryPoints: ['src/index.ts'],
  clean: true,
  format: ['cjs', 'esm'],
  dts: true,
};

export default tsupConfig;
