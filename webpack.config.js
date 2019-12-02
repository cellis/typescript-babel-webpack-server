/* eslint-disable */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = (env = {}) => {
  const output = path.join(__dirname, 'build');
  const entry = path.resolve('src/index.ts');

  return {
    target: 'node',
    plugins: [new CleanWebpackPlugin()],
    entry,
    externals: [nodeExternals()],
    devtool: 'inline-source-map',
    stats: 'errors-only',
    bail: true,
    resolve: {
      extensions: ['.ts', '.js', '.json']
    },
    output: {
      path: output,
      filename: 'index.js'
    },
    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.(js|ts)$/,
          use: [
            {
              loader: 'ts-loader'
            },
            'eslint-loader'
          ]
        }
      ]
    }
  };
};
/* eslint-enable */
