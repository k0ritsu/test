import cluster from 'node:cluster';
import process from 'node:process';
import { setTimeout } from 'node:timers/promises';
import { gracefulShutdown } from './graceful-shutdown.ts';

interface CreateWorker {
  (): Promise<{
    shutdown: () => Promise<void>;
  }>;
}

interface Config {
  parallelism: number;
  gracefulShutdown: {
    timeout: number;
  };
}

export async function createCluster(
  createWorker: CreateWorker,
  config: Config
) {
  if (cluster.isPrimary) {
    for (let i = 0; i < config.parallelism; i++) {
      cluster.fork(process.env).on('exit', async () => {
        if (cluster.workers) {
          const canExit = Object.values(cluster.workers).every((worker) => {
            return worker?.isDead();
          });

          if (canExit) {
            process.exit();
          }
        }
      });
    }

    gracefulShutdown(() => {
      return setTimeout(config.gracefulShutdown.timeout);
    });
  } else {
    const worker = await createWorker();

    gracefulShutdown(() => {
      return worker.shutdown();
    });
  }
}
