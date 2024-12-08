interface LogOptions {
  indent?: number;
}

type LogParams = [string, string[], LogOptions?];

/**
 * Console class to log messages
 */
export class Console {
  public static getLogText(...params: LogParams) {
    const [id, log, options] = params;
    const indent = ' '.repeat(options?.indent ?? 0 * 4);
    const prefix = `[ log | ${id.padEnd(15)}]`;

    return log.map((line) => `${prefix} ${indent}${line}`).join('\n');
  }

  public static log(...params: LogParams) {
    console.info(Console.getLogText(...params));
  }

  public static perf() {
    let hrTime: [number, number] | null = null;

    return {
      startLog: (...params: LogParams) => {
        hrTime = process.hrtime();
        Console.log(...params);
      },
      endLog: (...params: LogParams) => {
        if (hrTime === null) {
          throw new Error('perf Not started');
        }
        const [seconds, nanoseconds] = process.hrtime(hrTime);
        const [id, log, options] = params;
        const executionTimeMs =
          Math.round(seconds * 1000 + (nanoseconds / 1e6) * 1000) / 1000;

        Console.log(
          id,
          [...log, `Execution Time: ${executionTimeMs}ms`],
          options
        );
      },
    };
  }
}
