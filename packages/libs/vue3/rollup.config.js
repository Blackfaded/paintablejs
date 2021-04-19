import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import vue from 'rollup-plugin-vue';

export default {
  external: ['@paintablejs/core'],
  input: 'src/index.ts',
  output: [
    {
      format: 'cjs',
      file: '../../dist/vue3/js/index.js',
      sourcemap: false,
    },
    {
      format: 'esm',
      file: '../../dist/vue3/esm/index.js',
      sourcemap: false,
    },
  ],
  watch: {
    skipWrite: false,
    clearScreen: false,
    include: 'src/**/*',
  },
  plugins: [peerDepsExternal(), resolve(), commonjs(), vue(), typescript()],
};
