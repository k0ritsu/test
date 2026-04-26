import assert from 'node:assert';
import { glob, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { MODLOCK, MODRC, MODULE } from './common/constants.ts';
import type { Mod, Modlock, Modrc } from './common/types.ts';

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

  const modlock = await buildModlock();
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
      JSON.stringify(modlock, undefined, 2)
    )
  ]);
}

async function buildModlock(): Promise<Modlock> {
  const modules = await loadModules();
  const modlock: Modlock = {};

  for (const moduleName of modules.keys()) {
    modlock[moduleName] = buildModlockNode(moduleName, modules, new Set());
  }

  return modlock;
}

async function loadModules() {
  const dict = new Map<Mod['name'], Mod>();

  for await (const mod of glob(resolve('src', 'modules', '*', MODULE))) {
    const file = await readFile(mod, 'utf8');
    const json = JSON.parse(file) as Partial<Mod>;

    assert(json.name?.length, `${mod}: name is required`);
    assert(json.version?.length, `${mod}: version is required`);

    dict.set(json.name, {
      dependencies: parseDependencies(json.dependencies),
      name: json.name,
      version: json.version
    });
  }

  return dict;
}

function parseDependencies(dependencies: Mod['dependencies'] = {}) {
  assert(
    typeof dependencies === 'object' &&
      dependencies !== null &&
      !Array.isArray(dependencies),
    'dependencies must be an object'
  );

  const parsed: Mod['dependencies'] = {};

  for (const [name, version] of Object.entries(dependencies)) {
    assert(
      version?.length,
      `${name}: dependency version must be a non-empty string`
    );

    parsed[name] = version;
  }

  return parsed;
}

function buildModlockNode(
  name: string,
  modules: Map<string, Mod>,
  stack: Set<string>,
  fallbackVersion = ''
): Modlock[string] {
  const manifest = modules.get(name);
  if (!manifest) {
    return {
      dependencies: {},
      name,
      version: fallbackVersion
    };
  }

  const dependencies: Modlock = {};

  const nextStack = new Set(stack);
  nextStack.add(name);

  for (const [name, version] of Object.entries(manifest.dependencies).sort(
    ([left], [right]) => left.localeCompare(right)
  )) {
    if (nextStack.has(name)) {
      dependencies[name] = {
        name,
        version: modules.get(name)?.version ?? version,
        dependencies: {}
      };

      continue;
    }

    dependencies[name] = buildModlockNode(name, modules, nextStack, version);
  }

  return {
    dependencies,
    name: manifest.name,
    version: manifest.version
  };
}
