import { glob, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Mod, ModMain } from './types.js';

const MODULE = 'module.json';

export async function loadModules() {
  const modules: Array<
    Omit<Mod, 'main'> & {
      main: ModMain;
    }
  > = [];

  for await (const path of glob(
    resolve(import.meta.dirname, '..', 'modules', '*', MODULE),
    {
      withFileTypes: true
    }
  )) {
    const mod: Mod = JSON.parse(
      await readFile(resolve(path.parentPath, path.name), {
        encoding: 'utf8'
      })
    );

    if (mod.main && mod.enabled) {
      const main: ModMain = await import(resolve(path.parentPath, mod.main));

      modules.push({
        ...mod,
        main
      });
    }
  }

  return modules;
}
