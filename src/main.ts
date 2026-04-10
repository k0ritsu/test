import { availableParallelism } from 'node:os';
import { bootstrap } from './application.ts';
import { createCluster } from './cluster.ts';
import { loadConfig } from './config/config.ts';
import { GRACEFUL_SHUTDOWN_TIMEOUT } from './constants.ts';
import { gracefulShutdown } from './graceful-shutdown.ts';

const config = loadConfig();

if (config.USE_PARALLELISM) {
  await createCluster(
    async () => {
      return {
        shutdown: await bootstrap(config)
      };
    },
    {
      parallelism: availableParallelism(),
      gracefulShutdown: {
        timeout: GRACEFUL_SHUTDOWN_TIMEOUT
      }
    }
  );
} else {
  const shutdown = await bootstrap(config);

  gracefulShutdown(() => {
    return shutdown();
  });
}
