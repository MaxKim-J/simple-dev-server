import express, { type ErrorRequestHandler } from 'express';
import { getWebpackConfig } from '../../webpack/getWebpackConfig';

import { Bundler } from './bundler';
import { Watcher } from './watcher';
import { Console } from './console';
import { Socket } from './socket';

let app = express();

interface Params {
  name: string;
  rootPath: string;
  port: number;
  entry: string;
}

/**
 * Run Local Dev Server
 */
export const runDevServer = async ({ name, rootPath, port, entry }: Params) => {
  Console.log('server', [`Start Local Dev Server : ${name}`]);

  /**
   * Webpack Compiler
   */
  const webpackConfig = getWebpackConfig({ entry });
  const bundler = new Bundler(webpackConfig);
  await bundler.run(); // initial bundling

  /**
   * Socket
   */
  const socket = new Socket({ name, port });
  socket.connect();

  /**
   * Watcher
   */
  const watcher = new Watcher(rootPath);

  watcher.subscribe(async (eventLogs) => {
    socket.send({
      type: 'changeDetected',
      name,
      files: eventLogs,
    });
    await bundler.run();
    socket.send({
      type: 'compileSuccess',
      name,
    });
  });

  /**
   * HTML Handler
   */
  const clientSocketHandlerScript = socket.getClientSocketHandlerScript();

  app.get('/', async (_, res, next) => {
    try {
      const html = await bundler.readFile('index.html');

      const htmlString = html
        ?.toString('utf-8')
        .replace(
          '</body>',
          `<script>${clientSocketHandlerScript}</script>` + '\n</body>'
        );
      return res
        .set('Access-Control-Allow-Origin', '*')
        .set('content-type', 'text/html')
        .end(htmlString ?? html);
    } catch (error) {
      return next(error);
    }
  });

  /**
   * Static File Handler
   */
  app.get('/*', async (req, res, next) => {
    try {
      const fileName = (req.params as string[])[0] ?? '';
      const file = await bundler.readFile(fileName);
      return res.end(file);
    } catch (error) {
      return next(error);
    }
  });

  /**
   * Root Error Handler
   */
  const errorHandler: ErrorRequestHandler = (...[err, , res]) => {
    Console.log('server', ['unhandled error occured.', err]);
    res.status(500).end('Server Unhandled Error');
  };
  app.use(errorHandler);

  /**
   * Listener
   */
  socket.attachSocketEndpoint({ app }).listen(port, () => {
    Console.log('server', [`Local dev server start to listen at port ${port}`]);
  });

  process.on('SIGINT', () => {
    Console.log('server', ['Server gonna shutdown']);
    watcher.unsubscribe();
    socket.close();
    process.exit(0);
  });

  process.on('SIGTSTP', () => {
    Console.log('server', ['Server gonna shutdown']);
    watcher.unsubscribe();
    socket.close();
    process.exit(0);
  });
};
