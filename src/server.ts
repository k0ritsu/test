import type Router from 'find-my-way';
import http from 'node:http';

interface Config {
  port: number;
}

export async function createServer(
  router: Router.Instance<Router.HTTPVersion.V1>,
  config: Config
): Promise<http.Server> {
  const resolver = Promise.withResolvers<void>();
  const server = http
    .createServer(router.lookup.bind(router))
    .listen(config.port, resolver.resolve.bind(resolver));

  await resolver.promise;

  return server;
}
