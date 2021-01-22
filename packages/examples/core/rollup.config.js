import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.js',
  output: {
    file: 'public/bundle.js',
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: false,
  },
  plugins: [
    resolve({
      module: true,
      browser: true,
      preferBuiltins: false,
    }), // tells Rollup how to find date-fns in node_modules
    commonjs(), // converts date-fns to ES modules
  ],
};
