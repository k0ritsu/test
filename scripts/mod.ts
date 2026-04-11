import { glob, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const src = 'src';
const dist = 'dist';

for await (const mod of glob(resolve(src, 'modules', '*', 'module.json'))) {
  const file = await readFile(mod, 'utf8');
  const json = JSON.parse(file) as {
    main?: string;
  };

  if (typeof json.main === 'string') {
    json.main = json.main.replace(/\.ts$/, '.js');
  }

  await writeFile(
    resolve(dist, relative(src, mod)),
    JSON.stringify(json, undefined, 2)
  );
}
