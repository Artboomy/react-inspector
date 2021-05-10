/**
 * Adapted from https://github.com/reduxjs/redux/blob/master/rollup.config.js
 * Copyright (c) 2015-present Dan Abramov
 */

import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/es/react-inspector.js',
      format: 'es',
      indent: false,
      sourcemap: true,
      exports: 'named',
    },
    external: ['is-dom', 'prop-types', 'react'],
    plugins: [
      nodeResolve({
        mainFields: ['module', 'jsnext:main', 'main'],
      }),
      commonjs({
        include: 'node_modules/**',
      }),
      babel({ runtimeHelpers: true }),
      cleanup(),
    ],
  },
];
