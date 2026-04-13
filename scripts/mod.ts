import { glob, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

async function install(args: string[]) {}

async function uninstall(args: string[]) {}

async function build(args: string[]) {
  const { values } = parseArgs({
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
    resolve(values.rootDir, 'modules', '*', 'module.json')
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

const [command, ...args] = process.argv.slice(2);
switch (command) {
  case 'install':
    await install(args);
    break;
  case 'uninstall':
    await uninstall(args);
    break;
  case 'build':
    await build(args);
    break;
  default:
    throw new Error('unknown command');
}
