import path from 'node:path';
import webpack, { Configuration } from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';
import { Console } from './console';

/**
 * Bundler class to bundle files
 */
export class Bundler {
  private bundler: webpack.Compiler;
  private fs = createFsFromVolume(
    new Volume()
  ) as typeof this.bundler.outputFileSystem;

  constructor(config: Configuration) {
    this.bundler = webpack(config);
    this.bundler.outputFileSystem = this.fs;
  }

  private statLogger(stats: webpack.Stats) {
    console.info(stats.toString());
  }

  public async run() {
    const { startLog, endLog } = Console.perf();
    startLog('bundler', ['Run Bundler']);

    await new Promise((resolve, reject) => {
      this.bundler.run((err, stats) => {
        if (stats) {
          Console.log('bundler', ['Bundling Success']);
          this.statLogger(stats);
        }

        if (err || (stats && stats.hasErrors())) {
          Console.log('bundler', ['Bundling Failed']);
          reject(stats?.toString());
        }
        endLog('bundler', ['Ends Bundler']);
        resolve('success');
      });
    });
  }

  public get outputFileSystem() {
    return this.bundler.outputFileSystem!;
  }

  public async readFile(fileName: string) {
    return new Promise<Buffer | undefined>((resolve, reject) => {
      const filePath = path.resolve(this.bundler.outputPath, fileName);

      if (this.bundler.outputFileSystem === null) {
        Console.log('bundler', ['Bundle output is not exist']);
        reject('Bundle output is not exist');
        return;
      }

      this.bundler.outputFileSystem.readFile(filePath, (error, result) => {
        if (error) {
          Console.log('bundler', [`Fail to read file: ${filePath}`]);
          reject(error);
          return;
        }

        return resolve(result);
      });
    });
  }

  public get outputPath() {
    return this.bundler.outputPath!;
  }
}
