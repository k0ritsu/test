import type { Config } from './config/config.js';
import { loadModules } from './loader/loader.js';
import { createJsonHandler, createLogger } from './logger/logger.js';
import { createRouter } from './router/router.js';
import { createServer } from './server.js';

export async function bootstrap(config: Config) {
  const logger = createLogger(
    createJsonHandler({
      level: config.LOG_LEVEL
    })
  );

  const router = createRouter();
  const server = await createServer(router, {
    port: config.HTTP_PORT
  });

  logger.info(
    `Starting ${config.APP_NAME}@${config.APP_VERSION} on port ${config.HTTP_PORT}`
  );

  const modules = await loadModules();
  const hooks = await Promise.all(
    modules.map(async (module) => {
      logger.info(`Registering module ${module.name}@${module.version}`);

      return module.main.register({
        router,
        logger,
        modules
      });
    })
  );

  return async () => {
    const resolver = Promise.withResolvers<void>();

    server.close(() => {
      resolver.resolve();
    });

    await Promise.all([
      resolver.promise,
      ...hooks.map(({ shutdown }) => shutdown?.())
    ]);
  };
}
