import { Cli } from 'clipanion';
import { RunCommand } from '../src/commands/runCommand';

const [, , ...args] = process.argv;

export const cli = () => {
  const cli = new Cli({
    enableCapture: true,
    enableColors: true,
  });

  // register the command
  cli.register(RunCommand);

  cli.runExit(args);
};
