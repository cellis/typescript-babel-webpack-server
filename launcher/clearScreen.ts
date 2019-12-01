export default (): void => {
  // 1. Print empty lines until the screen is blank.
  process.stdout.write('\x1b[2J');

  // 2. Clear the scrollback. This works on mac
  process.stdout.write('\u001b[H\u001b[2J\u001b[3J');
};
