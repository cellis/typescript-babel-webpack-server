import nodemon from 'nodemon';
import webpack from 'webpack';
// @ts-ignore
import webpackOptions from '../webpack.config';

let monitor: typeof nodemon;

const options: any = webpackOptions;
const compiler = webpack(options());

const startMonitoring = (): void => {
  monitor = nodemon({
    script: '../build/index.js',
    watch: ['db/schema.sql'],
  });

  monitor.on('log', ({ colour }) => {
    console.log(colour);
  });

  process.on('exit', () => {
    monitor.emit('exit');
  });
};

compiler.watch(
  {
    // aggregateTimeout: 300,
  },
  err => {
    if (err) {
      console.log(err, '<< err');
    } else {
      if (!monitor) {
        startMonitoring();
      } else {
        monitor.emit('restart');
      }
    }
  }
);

process.once('SIGINT', () => {
  process.exit(0);
});
