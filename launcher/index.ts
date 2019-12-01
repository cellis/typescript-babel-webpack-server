import { ChildProcessWithoutNullStreams, execSync, spawn } from 'child_process';
import 'colors';
import isRunning from 'is-running';
// import pidofport from 'port-pid';
import readline from 'readline';
import yargs from 'yargs';
import clearScreen from './clearScreen';

interface Services {
  app?: ChildProcessWithoutNullStreams;
}

interface ServicesToRestart {
  [key: string]: boolean;
}

require('colors');

let enteringDebugKeysMode = false;
let debugKeyBuffer: string;

const services: Services = {};

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

let ipAddress: string;

try {
  ipAddress = execSync('ipconfig getifaddr en0').toString();
  ipAddress = ipAddress.replace(/\n/g, '');
} catch (error) {
  console.log('error', error);
}

function tryClear(): void {
  if (clear) {
    clearScreen();
  }
}

// function scheduleKill(pid: number, after: () => Promise<void>): void {
//   console.log('Scheduling kill of', pid);
//   const killInterval = setInterval(() => {
//     if (isRunning(pid)) {
//       try {
//         execSync(`kill -9 ${pid}`);
//       } catch (error) {
//         console.log('kill err', error);
//       }
//     } else {
//       clearInterval(killInterval);
//       after && after();
//     }
//   }, 0);
// }

const startApp = async (): Promise<void> => {
  tryClear();

  const spawnOpts = {
    detached: true,
  };

  const instructions = 'Press: s = stop debugging, r = run jest, d = debug\n';

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

    const envToAdd: any = {
      DEBUG,
    };

    if (debuggingMobile) {
      envToAdd.MOBILE_IP = ipAddress;
    }

    Object.assign(spawnOpts, {
      env: Object.assign(envToAdd, process.env),
    });

    console.log(instructions);
  } else {
    console.log('No DEBUG variables set.');
    console.log(instructions);
  }

  // const pids = await pidofport(3555);

  // if (pids.all.length) {
  //   console.log('scheduling kill');
  //   scheduleKill(pids.all.pop(), startApp);
  //   return;
  // }

  try {
    services.app = spawn(
      'webpack',
      ['--watch', '--mode', 'development'],
      spawnOpts
    );
  } catch (error) {
    console.log('error', error);
    process.exit();
  }

  if (services.app) {
    services.app.stdout.on('data', data => console.log(data.toString()));
    services.app.stderr.on('data', data => console.log(data.toString()));
  }
};

function kill(restart?: () => Promise<void>): void {
  if (services.app) {
    services.app.kill('SIGINT');
  }

  let count = 0;
  const killInterval = setInterval(() => {
    if (services.app) {
      if (isRunning(services.app.pid)) {
        count += 1;

        if (count > 20) {
          console.log('webpack did not exit gracefully, killing forcefully');
          services.app.kill('SIGKILL');
        } else {
          services.app.kill('SIGTERM');
        }
        // process.kill(-services.app.pid)
      } else {
        clearInterval(killInterval);
        restart && restart();
      }
    }
  }, 0);
}

function killAndRestart(): void {
  kill(startApp);

  //
  // killApps(['app']);
  console.log('Restarting...');
}

process.on('SIGINT', () => {
  console.log('SIGINT received');

  kill();
});

process.on('exit', () => {
  console.log('on `exit` fired');

  kill();
});

startApp();

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (!enteringDebugKeysMode) {
    if (key.ctrl && (key.name === 'c' || key.name === 'd')) {
      console.log('CTRL+', key.name, 'pressed, exiting');
      process.exit();
    } else if (key.name === 'd') {
      console.log('Enter debug key to restart with, then press enter'.yellow);
      console.log('Separate multiple keys with a space'.magenta);
      console.log(
        'Add \'mobile\' in the keys to listen on local ip for mobile'.cyan
      );
      enteringDebugKeysMode = true;
      debugKeyBuffer = '';
    } else if (key.name === 's') {
      console.log('Ending debug session');
      debugKeyBuffer = '';
      killAndRestart();
    }
  } else if (key.name === 'return') {
    if (debugKeyBuffer.length > 0) {
      tryClear();

      console.log(`Debugging with DEBUG=${debugKeyBuffer}`);
      enteringDebugKeysMode = false;
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
