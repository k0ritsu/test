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
        cluster.fork();
      }
    });

    for (let i = 0; i < config.parallelism; i++) {
      cluster.fork(process.env);
    }

    return () => resolver.promise;
  } else {
    const { shutdown } = await createWorker();

    return async () => {
      await shutdown();
      cluster.worker?.disconnect();
    };
  }
}
