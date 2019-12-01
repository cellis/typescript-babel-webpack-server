/* eslint-disable */

const NodemonPlugin = require('nodemon-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
/* eslint-enable */

module.exports = (env = {}) => {
  return {
    target: 'node',
    entry: path.resolve('src/index.ts'),
    externals: [nodeExternals()],
    devtool: 'inline-source-map',
    stats: 'errors-only',
    bail: true,
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'index.js',
    },
    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.(js|ts)$/,
          use: [
            {
              loader: 'ts-loader',
            },
            'eslint-loader',
          ],
        },
      ],
    },
    plugins: [
      // new webpack.DefinePlugin(env),
      new NodemonPlugin({
        ignore: ['src'],
        watch: path.join(__dirname, 'build', 'index.js'),
        // quiet: true,
        // verbose: true,
        // events: {
        //   start: 'clear',
        // },
      }),
    ],
  };
};
