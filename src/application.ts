import type { Config } from './config/config.ts';
import { loadModules } from './loader/loader.ts';
import { createRouter } from './router.ts';
import { createServer } from './server.ts';

export async function bootstrap(config: Config) {
  const router = createRouter();
  const server = await createServer(router, {
    port: config.PORT
  });

  const modules = await loadModules();
  await Promise.all(
    modules.map(async (module) => {
      const main = await module.main.register();
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
