import 'colors';
import notifier from 'node-notifier';
import nodemon from 'nodemon';
import { resolve } from 'path';
import readline from 'readline';
import webpack from 'webpack';
import yargs from 'yargs';
import pkg from '../package.json';
// @ts-ignore
import webpackOptions from '../webpack.config';
import clearScreen from './clearScreen';

let monitor: typeof nodemon;
let enteringDebugKeysMode = false;
let debugKeyBuffer: string;
let ipAddress: string;
let shouldRestart = false;
let wasBroken = false;
let env: any = {};

const { argv } = yargs
  .command('$0 [command]', 'Run the server')
  .options({
    clear: {
      describe: 'Clear screen when restarting',
      default: true,
      alias: 'c',
      type: 'boolean',
    },
  })
  .help();

const { clear } = argv;

function tryClear(): void {
  if (clear) {
    clearScreen();
  }
}

const options: any = webpackOptions;
const compiler = webpack(options());
const instructions = 's = stop debugging, d = debug\n';

const setupEnv = (): void => {
  env = {};

  if (debugKeyBuffer) {
    let multipleKeys;
    let debuggingMobile = false;
    if (debugKeyBuffer.includes(' ')) {
      multipleKeys = debugKeyBuffer.split(' ');

      const indexOfMobile = multipleKeys.indexOf('mobile');
      if (indexOfMobile !== -1) {
        multipleKeys.splice(indexOfMobile, 1);
        debuggingMobile = true;
      }
    }

    if (debugKeyBuffer === 'mobile') {
      debuggingMobile = true;
      console.log('Listening on ip:'.cyan, ipAddress, 'for mobile'.cyan);
    }

    console.log(`${'Running with DEBUG'.yellow}=${debugKeyBuffer.magenta} \n`);
    const DEBUG = multipleKeys ? multipleKeys.join(',') : debugKeyBuffer;

    env = {
      DEBUG,
    };

    if (debuggingMobile) {
      env.MOBILE_IP = ipAddress;
    }
  } else {
    console.log('No DEBUG variables set.');
  }
};

const startMonitoring = (): void => {
  shouldRestart = false;
  monitor = nodemon({
    script: '../build/index.js',
    watch: ['db/schema.sql'],
    env,
  });

  monitor.on('start', () => {
    tryClear();
    console.log(instructions);
  });

  monitor.on('exit', () => {
    if (shouldRestart) {
      startMonitoring();
    }
  });

  process.on('exit', () => {
    shouldRestart = false;
    monitor.emit('exit');
  });
};

const startApp = (): void => {
  tryClear();

  env = {};

  compiler.watch({}, (err, stats) => {
    if (err) {
      console.log(err, '<< err');
    } else {
      if (!stats.compilation.errors.length) {
        if (!monitor) {
          startMonitoring();
        } else if (monitor) {
          monitor.restart();
        }

        if (wasBroken) {
          wasBroken = false;
          notifier.notify({
            title: `Successful build of ${pkg.name}!`,
            message: `Build fixed in ${pkg.name}`,
            icon: resolve(__dirname, './green.png'),
          });
        }
      } else {
        wasBroken = true;
        console.log(stats.compilation.errors.map(er => er.message).join('\n'));

        notifier.notify({
          title: `Error in ${pkg.name}`,
          message: 'See terminal for details',
          icon: resolve(__dirname, './red.png'),
        });
      }
    }
  });
};

const killAndRestart = (): void => {
  if (monitor) {
    shouldRestart = true;

    monitor.emit('quit');
  }
};

startApp();

readline.emitKeypressEvents(process.stdin);
if (process.stdin.setRawMode) {
  process.stdin.setRawMode(true);
}
process.stdin.on('keypress', (str, key) => {
  if (!enteringDebugKeysMode) {
    if (key.ctrl && (key.name === 'c' || key.name === 'd')) {
      console.log('CTRL+', key.name, 'pressed, exiting');
      process.exit();
    } else if (key.name === 'd') {
      console.log('\nEnter debug key to restart with, then press enter'.yellow);
      console.log('Separate multiple keys with a space'.magenta);
      console.log(
        'Add \'mobile\' in the keys to listen on local ip for mobile'.cyan
      );
      enteringDebugKeysMode = true;
      debugKeyBuffer = '';
    } else if (key.name === 's' && !!debugKeyBuffer) {
      console.log('Ending debug session');
      debugKeyBuffer = '';

      setupEnv();
      killAndRestart();
    }
  } else if (key.name === 'return') {
    if (debugKeyBuffer.length > 0) {
      tryClear();

      enteringDebugKeysMode = false;

      setupEnv();
      killAndRestart();
    }
  } else if (key.name === 'escape') {
    debugKeyBuffer = '';
    enteringDebugKeysMode = false;
    console.log('Cancelled debug session');
  } else {
    if (key.name === 'backspace' && debugKeyBuffer.length > 0) {
      debugKeyBuffer = debugKeyBuffer.substr(0, debugKeyBuffer.length - 1);
    } else {
      let upperCase;
      if (key.shift) {
        upperCase = key.name && key.name.toUpperCase();
      }

      const char = upperCase || key.sequence || key.name;
      debugKeyBuffer += char;
    }

    tryClear();

    console.log('Enter DEBUG variables or press ESC to cancel`');
    console.log('Separate multiple keys with a space\n');
    console.log('DEBUG:', debugKeyBuffer.magenta, '\n');

    console.log('Press ENTER to begin debugging');
  }
});

process.once('SIGINT', () => {
  process.exit(0);
});
