import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Mod, ModMain } from './types.js';

const MODULE = 'module.json';

export async function loadModules() {
  const items = await readdir(resolve(import.meta.dirname, '..', 'modules'), {
    withFileTypes: true
  });

  return Promise.all(
    items.map(async (item) => {
      if (!item.isDirectory()) {
        return;
      }

      const path = resolve(item.parentPath, item.name);

      const modPath = resolve(path, MODULE);
      const mod: Record<'default', Mod> = await import(modPath, {
        with: {
          type: 'json'
        }
      });

      if (!mod.default.enabled) {
        return;
      }

      const mainPath = resolve(path, mod.default.main);
      const main: ModMain = await import(mainPath);

      return {
        ...mod.default,
        main
      };
    })
  ).then((modules) => {
    return modules.filter(
      (module): module is NonNullable<typeof module> => module !== undefined
    );
  });
}
