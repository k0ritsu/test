import Router from 'find-my-way';
import { NotFound } from './errors/not-found.ts';

export type Router = ReturnType<typeof createRouter> & {
  routes: Array<{
    method: Router.HTTPMethod;
    path: string;
    opts: Router.RouteOptions;
    handler: Router.Handler<Router.HTTPVersion.V1>;
    store: any;
  }>;
};

export function createRouter() {
  return Router({
    defaultRoute: (req, res) => {
      const err = new NotFound(req.url);

      return res
        .writeHead(err.status, {
          'content-type': 'application/problem+json'
        })
        .end(JSON.stringify(err));
    }
  });
}
