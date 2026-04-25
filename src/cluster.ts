import cluster from 'node:cluster';
import process from 'node:process';

interface CreateWorker {
  (): Promise<{
    shutdown(): Promise<void>;
  }>;
}

interface Config {
  parallelism: number;
}

export async function createCluster(
  createWorker: CreateWorker,
  config: Config
) {
  if (cluster.isPrimary) {
    const resolver = Promise.withResolvers<void>();

    cluster.on('exit', (worker) => {
      if (worker.exitedAfterDisconnect) {
        if (
          cluster.workers &&
          Object.values(cluster.workers).every((worker) => worker?.isDead())
        ) {
          resolver.resolve();
        }
      } else {
        cluster.fork(process.env);
      }
    });

    for (let i = 0; i < config.parallelism; i++) {
      cluster.fork(process.env);
    }

    return () => {
      if (cluster.workers) {
        Object.values(cluster.workers).forEach((worker) => {
          worker?.disconnect();
        });
      }

      return resolver.promise;
    };
  } else {
    const { shutdown } = await createWorker();

    return shutdown;
  }
}
