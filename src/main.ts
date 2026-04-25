import { bootstrap } from './application.ts';
import { loadConfig } from './config/config.ts';
import { gracefulShutdown } from './graceful-shutdown.ts';

const config = loadConfig();

if (config.USE_PARALLELISM) {
  const { availableParallelism } = await import('node:os');
  const { createCluster } = await import('./cluster.ts');

  gracefulShutdown(
    await createCluster(
      async () => ({
        shutdown: await bootstrap(config)
      }),
      {
        parallelism: availableParallelism()
      }
    )
  );
} else {
  gracefulShutdown(await bootstrap(config));
}
