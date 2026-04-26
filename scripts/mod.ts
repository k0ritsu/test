#!/usr/bin/env node

import assert from 'node:assert';
import { glob, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const modlock = 'modlock.json';
const modrc = 'modrc.json';
const module = 'module.json';

interface Mod {
  name: string;
  version: string;
}

interface Modlock {
  [mod: string]: Mod & {
    dependencies: Modlock;
  };
}

interface Modrc {
  registry: string;
}

async function init(args: string[]) {
  const { values } = parseArgs({
    strict: true,
    options: {
      registry: {
        type: 'string'
      },
      rootDir: {
        type: 'string',
        default: 'src'
      }
    },
    args
  });

  assert(values.registry, 'registry is required');

  await Promise.all([
    writeFile(
      resolve(values.rootDir, 'modules', modrc),
      JSON.stringify(
        {
          registry: values.registry
        } satisfies Modrc,
        undefined,
        2
      )
    ),
    writeFile(
      resolve(values.rootDir, 'modules', modlock),
      JSON.stringify({} satisfies Modlock)
    )
  ]);
}

async function publish(args: string[]) {
  throw new Error('not implemented');
}

async function build(args: string[]) {
  const { values } = parseArgs({
    strict: true,
    options: {
      rootDir: {
        type: 'string',
        default: 'src'
      },
      outDir: {
        type: 'string',
        default: 'dist'
      }
    },
    args
  });

  for await (const mod of glob(
    resolve(values.rootDir, 'modules', '*', module)
  )) {
    const file = await readFile(mod, 'utf8');
    const json = JSON.parse(file) as {
      main?: string;
    };

    if (typeof json.main === 'string') {
      json.main = json.main.replace(/\.ts$/, '.js');
    }

    await writeFile(
      resolve(values.outDir, relative(values.rootDir, mod)),
      JSON.stringify(json, undefined, 2)
    );
  }
}

async function install(args: string[]) {
  throw new Error('not implemented');
}

async function remove(args: string[]) {
  throw new Error('not implemented');
}

const [command, ...args] = process.argv.slice(2);
switch (command) {
  case 'init':
    await init(args);
    break;
  case 'publish':
    await publish(args);
    break;
  case 'build':
    await build(args);
    break;
  case 'install':
    await install(args);
    break;
  case 'remove':
    await remove(args);
    break;
  default:
    throw new Error('unknown');
}
