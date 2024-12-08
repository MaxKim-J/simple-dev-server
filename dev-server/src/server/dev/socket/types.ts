interface SocketMessage {
  type: 'compileSuccess' | 'changeDetected' | 'compileError';
}

export interface compileSuccessMessage extends SocketMessage {
  name: string;
}

export interface compileErrorMessage extends SocketMessage {
  error: string;
}
export interface changeDetectedMessage extends SocketMessage {
  name: string;
  files: string[];
}

export type Message =
  | compileSuccessMessage
  | compileErrorMessage
  | changeDetectedMessage;
