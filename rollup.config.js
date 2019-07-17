import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy';
import scss from 'rollup-plugin-scss';
// import url from 'rollup-plugin-url';
import md from 'rollup-plugin-md';

const targetDir = 'docs';

// Grab the NODE_ENV and store in targetEnv, default to 'production' if undefined
const { NODE_ENV: targetEnv = 'production' } = process.env;

// Work out if we're targetting development
const isDev = (targetEnv === 'development');

// Define baseline plugins for transformation
const jsPlugins = [
  resolve(),
  commonjs({
    include: 'node_modules/**',
    namedExports: { 'node_modules/react-is/index.js': ['isValidElementType'] },
  }),
  babel({
    configFile: false, // Read config from here, not babel config file
    runtimeHelpers: true, // Include runtime Helpers
    exclude: 'node_modules/**', // Only transpile our source code
    presets: [ // Setup presets
      ['@babel/env', { modules: false }],
      ['@babel/react', {}],
    ],
    plugins: [ // Setup plugins
      '@babel/transform-runtime',
    ],
  }),
  // isDev ? undefined : uglify(), // Uglify code unless we're targetting 'development'
  copy({ // Copy modules to the vendor directory
    targets: [
      {
        src: 'src/static/*',
        dest: targetDir,
      },
      {
        src: [
          'node_modules/react/umd/react.development.js',
          'node_modules/react-dom/umd/react-dom.development.js',
        ],
        dest: `${targetDir}/js/vendor`,
      },
      {
        src: 'reports.csv',
        dest: `${targetDir}`,
      },
    ],
  }),
  scss({
    output: `${targetDir}/style/dashboard.css`,
    outputStyle: 'compressed',
  }),
  // url(),
  md(),
];

export default [
  {
    input: 'src/app.js',
    plugins: jsPlugins,
    external: ['react', 'react-dom'],
    output: {
      dir: `${targetDir}/js`,
      format: 'iife',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
      },
    },
  }
];
