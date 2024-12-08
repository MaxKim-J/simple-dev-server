import { static as _static, type Express } from 'express';
import { createServer } from 'node:http';
import { Console } from '../console';

import { Message } from './types';

import { WebSocketServer, WebSocket } from 'ws';

export class Socket {
  private wss: WebSocketServer;
  private port: number;
  private name: string;
  private connection: WebSocket | null = null;

  private ENDPOINT = '/dev-server-socket';

  constructor({ port, name }: { name: string; port: number }) {
    this.port = port;
    this.name = name;
    this.wss = new WebSocketServer({ noServer: true });
  }

  public connect() {
    this.wss.on('connection', (connection) => {
      Console.log('socket-server', [
        `Socket connected with Request from client.`,
      ]);
      this.connection = connection;
    });
  }

  public attachSocketEndpoint({ app }: { app: Express }) {
    const server = createServer(app);

    server.on('upgrade', (request, socket, head) => {
      const pathname = request.url;

      if (pathname === this.ENDPOINT) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    return server;
  }

  private serializeMessage(message: Message) {
    return JSON.stringify(message);
  }

  public send(message: Message) {
    if (this.connection !== null) {
      const serializedMessage = this.serializeMessage(message);
      this.connection.send(serializedMessage);
    }
  }

  public close() {
    this.wss.close();
  }

  public getClientSocketHandlerScript() {
    const script = `// Socket Client Code
if (window['dev-server-socket-${this.name}'] === undefined) {
  window['dev-server-socket-${this.name}'] = new WebSocket('ws://localhost:${
      this.port
    }${this.ENDPOINT}');

  window['dev-server-socket-${this.name}'].onopen = () => {
    console.log('${Console.getLogText('socket-client', [
      `${this.name}: App connected to web socket. localhost:${this.port}${this.ENDPOINT}`,
    ])}');
    };

  window['dev-server-socket-${this.name}'].onmessage = (event) => {
    const parsedEvent = JSON.parse(event.data);
    const logText = '${Console.getLogText('socket-client', [''])}'

    if (parsedEvent?.type === 'compileSuccess') {
      console.log(logText + \`\${parsedEvent?.name}: App Recompiled.\`)
      window.location.reload();
    }

    if (parsedEvent?.type === 'changeDetected') {
      console.log(logText + \`\${parsedEvent?.name}: Changes detected.\`)
   
      parsedEvent?.files.forEach((file) => {
        console.log(logText + \` - \${file}\`)
      })
    }
  };

  window['dev-server-socket-${this.name}'].onclose = () => {
    console.log('${Console.getLogText('socket-client', [
      `${this.name}: App disconnected to web socket. localhost:${this.port}${this.ENDPOINT}`,
    ])}');
  };
}`;

    return script;
  }
}
