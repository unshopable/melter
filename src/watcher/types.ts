export type WatcherOptions = {
  cwd: string;
  ignoreInitial: boolean;
  persistent: boolean;
  usePolling: boolean;
  interval: number;
  binaryInterval: number;
};

export type WatcherEvent =
  | 'started'
  | 'ready'
  | 'finished'
  | 'error'
  | 'warning'
  | 'addFile'
  | 'updateFile'
  | 'removeFile';

export type WatcherListener = (...data: any[]) => void;

export type WatcherWarning = {
  path: string;
  message: string;
};
