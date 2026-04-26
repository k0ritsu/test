import { glob, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { MODULE } from './common/constants.ts';

export async function build(args: string[]) {
  for await (const mod of glob(resolve('src', 'modules', '*', MODULE))) {
    const file = await readFile(mod, 'utf8');
    const json = JSON.parse(file) as {
      main?: string;
    };

    if (typeof json.main === 'string') {
      json.main = json.main.replace(/\.ts$/, '.js');
    }

    await writeFile(
      resolve('src', relative('src', mod)),
      JSON.stringify(json, undefined, 2)
    );
  }
}
