/**
 * @type {import('rollup').RollupOptions}
 */
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import PKG_JSON from './package.json';

const plugins = [
  resolve({
    browser: true,
  }),
  commonjs(),
  babel({
    babelHelpers: 'bundled',
    extensions: ['.ts', '.tsx'],
  }),
  typescript({
    tsconfig: './tsconfig.build.json',
    declaration: true,
    declarationDir: '',
  }),
  terser({
    ecma: 5,
    compress: true,
    mangle: true,
  }),
];

const output = [
  { file: PKG_JSON.main, format: 'cjs' },
  { file: PKG_JSON.module, format: 'es' },
];

export default {
  input: 'src/index.ts',
  external: ['react', 'react-dom'],
  output,
  plugins,
};
