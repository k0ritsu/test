import type { Config } from './config/config.ts';
import { loadModules } from './loader/loader.ts';
import { createJsonHandler, createLogger } from './logger/logger.ts';
import { createRouter } from './router.ts';
import { createServer } from './server.ts';

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
  await Promise.all(
    modules.map(async (module) => {
      logger.info(`Registering module ${module.name}@${module.version}`);

      const main = await module.main.register({
        config,
        logger,
        modules
      });

      main.router?.routes.forEach((route) => {
        router.on(
          route.method,
          route.path,
          route.opts,
          route.handler,
          route.store
        );
      });
    })
  );

  return () => {
    const resolver = Promise.withResolvers<void>();

    server.close(() => {
      resolver.resolve();
    });

    return resolver.promise;
  };
}
