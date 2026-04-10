import type Router from 'find-my-way';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

interface Module {
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  main: string;
}

interface ModuleMain {
  register(): Promise<{
    router?: {
      routes: Array<{
        method: Router.HTTPMethod;
        path: string;
        opts: Router.RouteOptions;
        handler: Router.Handler<Router.HTTPVersion.V1>;
        store: any;
      }>;
    };
  }>;
}

export async function loadModules() {
  const items = await readdir(resolve(process.cwd(), 'src/modules'), {
    withFileTypes: true
  });

  return Promise.all(
    items.map(async (item) => {
      if (!item.isDirectory()) {
        return;
      }

      const path = resolve(item.parentPath, item.name);

      const jsonPath = resolve(path, 'module.json');
      const json: Record<'default', Module> = await import(jsonPath, {
        with: {
          type: 'json'
        }
      });

      if (!json.default.enabled) {
        return;
      }

      const mainPath = resolve(path, json.default.main);
      const main: ModuleMain = await import(mainPath);

      return {
        ...json.default,
        main
      };
    })
  ).then((modules) => {
    return modules.filter(
      (module): module is NonNullable<typeof module> => module !== undefined
    );
  });
}
