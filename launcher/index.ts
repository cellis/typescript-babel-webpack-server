import nodemon from 'nodemon';
import webpack from 'webpack';
import webpackOptions from './webpack.config';

const monitor = nodemon({
  script: '../build/index.js',
});

const compiler = webpack(webpackOptions());

compiler.watch(
  {
    aggregateTimeout: 300,
  },
  (err, stats) => {
    if (err) {
      console.log(err, '<< err');
    } else {
      monitor.emit('restart');
    }
  }
);

monitor.on('log', ({ colour }) => {
  console.log(colour);
});

process.on('exit', () => {
  monitor.emit('exit');
});

process.once('SIGINT', () => {
  process.exit(0);
});
