import { defineConfig } from 'tsup';

export default defineConfig({
  target: 'node16',
  entry: ['src/**/*.ts'],
  format: ['esm', 'cjs'],
  bundle: false,
  treeshake: true,
  dts: true,
});
