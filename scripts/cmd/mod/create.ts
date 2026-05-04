import assert from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { MODULE, MODULE_NAME } from './common/constants.ts';
import { createTsconfigs } from './common/helpers/tsconfig.ts';
import type { Mod } from './common/types.ts';

export async function create(args: string[]) {
  const { positionals } = parseArgs({
    strict: true,
    allowPositionals: true,
    args
  });

  assert(positionals.length === 1, 'module name is required');

  const [name = ''] = positionals;
  assert(MODULE_NAME.test(name), `${name}: invalid module name`);

  const root = resolve('src', 'modules', name);
  const mod = {
    name,
    version: '0.1.0'
  } satisfies Pick<Mod, 'name' | 'version'>;

  await mkdir(root);
  await writeFile(resolve(root, MODULE), JSON.stringify(mod, undefined, 2));
  await createTsconfigs([
    {
      root,
      name
    }
  ]);
}
