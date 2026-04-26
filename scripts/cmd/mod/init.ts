import assert from 'node:assert';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { MODLOCK, MODRC } from './common/constants.ts';
import type { Modlock, Modrc } from './common/types.ts';

export async function init(args: string[]) {
  const { values } = parseArgs({
    strict: true,
    options: {
      registry: {
        type: 'string'
      }
    },
    args
  });

  assert(values.registry, 'registry is required');

  await Promise.all([
    writeFile(
      resolve('src', 'modules', MODRC),
      JSON.stringify(
        {
          registry: values.registry
        } satisfies Modrc,
        undefined,
        2
      )
    ),
    writeFile(
      resolve('src', 'modules', MODLOCK),
      JSON.stringify({} satisfies Modlock)
    )
  ]);
}
