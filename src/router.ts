import Router from 'find-my-way';
import { NotFound } from './errors/not-found.ts';

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
