import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'cjs',
      file: '../dist/core/js/index.js',
      sourcemap: false,
    },
    {
      format: 'esm',
      file: '../dist/core/esm/index.js',
      sourcemap: false,
    },
  ],
  watch: {
    skipWrite: false,
    clearScreen: false,
    include: 'src/**/*',
  },
  plugins: [peerDepsExternal(), resolve(), commonjs(), typescript()],
};
