import process from 'node:process';
import { GRACEFUL_SHUTDOWN_TIMEOUT } from './constants.ts';

class GracefulShutdownTimeout extends Error {
  constructor(timeout: number) {
    super(`Graceful shutdown timed out after ${timeout}ms`);
  }
}

export function gracefulShutdown(shutdown: () => Promise<void>) {
  async function listener(signal: NodeJS.Signals) {
    await Promise.race([
      shutdown(),
      new Promise<void>((_, reject) => {
        setTimeout(() => {
          reject(new GracefulShutdownTimeout(GRACEFUL_SHUTDOWN_TIMEOUT));
        }, GRACEFUL_SHUTDOWN_TIMEOUT);
      })
    ]);

    process.kill(process.pid, signal);
  }

  process.once('SIGINT', listener);
  process.once('SIGTERM', listener);
}
