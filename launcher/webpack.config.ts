/* eslint-disable */
import path from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

export default (env = {}): webpack.Configuration => {
  console.log(__dirname, '<< __dirname');
  const output = path.join(__dirname, '..', 'build');
  console.log(output, '<< output');
  return {
    target: 'node',
    entry: path.resolve('src/index.ts'),
    externals: [nodeExternals()],
    devtool: 'inline-source-map',
    stats: 'errors-only',
    bail: true,
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
    // plugins: [
    //   // new webpack.DefinePlugin(env),
    //   new NodemonPlugin({
    //     ignore: ['src'],
    //     watch: path.join(__dirname, 'build', 'index.js')
    //     // quiet: true,
    //     // verbose: true,
    //     // events: {
    //     //   start: 'clear',
    //     // },
    //   })
    // ]
  };
};
/* eslint-enable */
