import { Command } from 'clipanion';
import path from 'path';
import { type Configuration } from 'webpack';

import { runDevServer } from '../server/dev';

export class RunCommand extends Command {
  static paths = [['run'], Command.Default];

  async execute() {
    const rootPath = process.env.PWD as string;

    const { port, name, entry } = (
      await import(path.resolve(rootPath, 'config.mjs'))
    ).default;

    runDevServer({ rootPath, name, port, entry });
  }
}
