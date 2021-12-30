/**
 * @type {import('rollup').RollupOptions}
 */
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const plugins = [
  resolve({
    browser: true,
  }),
  commonjs(),
  terser({
    ecma: 5,
    compress: true,
    mangle: true,
  }),
];

const cjs = {
  input: 'src/index.ts',
  external: ['react', 'react-dom'],
  output: {
    dir: 'dist/cjs',
    format: 'cjs',
  },
  plugins: [
    ...plugins,
    babel({
      babelHelpers: 'bundled',
      extensions: ['.ts', '.tsx'],
    }),
    typescript({
      tsconfig: './tsconfig.build.json',
      declaration: true,
      declarationDir: 'dist/cjs',
      outputToFilesystem: true,
    }),
  ],
};

const esm = {
  input: 'src/index.ts',
  external: ['react', 'react-dom'],
  output: {
    dir: 'dist/esm',
    format: 'es',
    preserveModules: true,
    preserveModulesRoot: 'src',
    exports: 'named',
  },
  plugins: [
    ...plugins,
    typescript({
      tsconfig: './tsconfig.build.json',
      declaration: true,
      declarationDir: 'dist/esm',
      outputToFilesystem: true,
    }),
  ],
};

export default [cjs, esm];
