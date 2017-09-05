const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const version = require('../package.json').version;

module.exports = {
  input: 'src/index.js',
  output: {
    format: 'es',
    file: 'dist/json-pure.esm.js'
  },
  plugins: [
    replace({ __VERSION__: version }),
    nodeResolve(),
    commonjs()
  ],
  banner:
`/**
 * vue-json-pure v${version}
 * (c) ${new Date().getFullYear()} Moritz Sternemann
 * @license MIT
 */`
};
