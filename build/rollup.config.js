const buble = require('rollup-plugin-buble');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const version = require('../package.json').version;

module.exports = {
  input: 'src/index.js',
  output: {
    format: 'umd',
    file: 'dist/json-pure.js',
  },
  name: 'VueJsonPure',
  plugins: [
    replace({ __VERSION__: version }),
    nodeResolve(),
    commonjs(),
    buble()
  ],
  banner:
`/**
 * vue-json-pure v${version}
 * (c) ${new Date().getFullYear()} Moritz Sternemann
 * @license MIT
 */`
};
