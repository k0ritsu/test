#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function fixImports(args: string[]) {
  const path = resolve('package.json');

  const file = await readFile(path, 'utf8');
  const json = JSON.parse(file) as {
    imports?: Record<string, string>;
  };

  if (typeof json.imports === 'object') {
    const src = /^\.\/src/;
    const ext = /\.ts$/;

    json.imports = Object.fromEntries(
      Object.entries(json.imports).map(([key, val]) => {
        return [key, val.replace(src, './dist').replace(ext, '.js')];
      })
    );
  }

  await writeFile(path, JSON.stringify(json, undefined, 2));
}

const [command, ...args] = process.argv.slice(2);
switch (command) {
  case 'fix-imports':
    await fixImports(args);
    break;
  default:
    throw new Error('unknown');
}
