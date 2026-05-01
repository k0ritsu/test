import { glob, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { MODULE } from './common/constants.ts';
import type { Mod } from './common/types.ts';

export async function build(args: string[]) {
  for await (const path of glob(resolve('src', 'modules', '**', MODULE))) {
    const mod: Mod = JSON.parse(
      await readFile(path, {
        encoding: 'utf8'
      })
    );

    if (typeof mod.main === 'string') {
      mod.main = mod.main.replace(/\.ts$/, '.js');
    }

    const dist = resolve('dist', relative(resolve('src'), path));
    await mkdir(dirname(dist), {
      recursive: true
    });
    await writeFile(dist, JSON.stringify(mod, undefined, 2));
  }
}
