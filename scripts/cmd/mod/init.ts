import assert from 'node:assert';
import { access, glob, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { MODLOCK, MODRC, MODULE } from './common/constants.ts';
import { createTsconfigs } from './common/helpers/tsconfig.ts';
import type { Mod, Modlock, Modrc } from './common/types.ts';

type Key = `${Mod['name']}@${Mod['version']}`;

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

  const modlock = await buildModlock();
  await Promise.all([
    writeModrc(values.registry),
    writeFile(
      resolve('src', 'modules', MODLOCK),
      JSON.stringify(modlock, undefined, 2)
    ),
    createTsconfigs()
  ]);
}

async function writeModrc(registry?: string) {
  const path = resolve('src', 'modules', MODRC);
  try {
    await access(path);

    return;
  } catch {
    assert(registry, 'registry is required');

    return writeFile(
      path,
      JSON.stringify(
        {
          registry
        } satisfies Modrc,
        undefined,
        2
      )
    );
  }
}

async function buildModlock() {
  const modules = await loadModules();
  const modlock: Modlock = {};

  for (const key of modules.keys()) {
    const [name = ''] = key.split('@');
    modlock[name] = buildModlockNode(key, modules, new Set<Key>());
  }

  return modlock;
}

async function loadModules() {
  const modules = new Map<Key, Mod>();

  for await (const path of glob(resolve('src', 'modules', '**', MODULE))) {
    const mod: Partial<Mod> = JSON.parse(
      await readFile(path, {
        encoding: 'utf8'
      })
    );

    assert(mod.name, `${path}: name is required`);
    assert(mod.version, `${path}: version is required`);

    const key: Key = `${mod.name}@${mod.version}`;
    modules.set(key, {
      dependencies: ensureDependencies(mod.name, mod.dependencies),
      name: mod.name,
      version: mod.version
    });
  }

  return modules;
}

function ensureDependencies(
  name: string,
  dependencies: Mod['dependencies'] = {}
) {
  assert(
    typeof dependencies === 'object' &&
      dependencies !== null &&
      !Array.isArray(dependencies),
    `${name}: dependencies must be an object`
  );

  for (const [name, version] of Object.entries(dependencies)) {
    assert(version, `${name}: dependency version must be a non-empty string`);
  }

  return dependencies;
}

function buildModlockNode(
  key: Key,
  modules: Map<Key, Mod>,
  stack: Set<Key>,
  fallback: Pick<Mod, 'version'> = {
    version: ''
  }
): Modlock[string] {
  const mod = modules.get(key);
  if (!mod) {
    const [name = ''] = key.split('@');

    return {
      dependencies: {},
      name,
      version: fallback.version
    };
  }

  const dependencies: Modlock = {};

  const nextStack = new Set<Key>(stack);
  nextStack.add(key);

  for (const [name, version] of Object.entries(mod.dependencies)) {
    const key: Key = `${name}@${version}`;
    if (nextStack.has(key)) {
      dependencies[name] = {
        dependencies: {},
        name,
        version: modules.get(key)?.version ?? version
      };

      continue;
    }

    dependencies[name] = buildModlockNode(key, modules, nextStack, {
      version
    });
  }

  return {
    dependencies,
    name: mod.name,
    version: mod.version
  };
}
