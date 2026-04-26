import type { LoadHook, ResolveHook } from 'node:module';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const EXTENSION = extname(import.meta.filename);
const NODE_MODULES = pathToFileURL(join(process.cwd(), 'node_modules')).href;
const MODULES = pathToFileURL(import.meta.dirname).href;

export const resolve: ResolveHook = (specifier, context, nextResolve) => {
  if (context.parentURL?.startsWith(NODE_MODULES)) {
    return nextResolve(specifier, context);
  }

  if (context.parentURL?.startsWith(MODULES)) {
    specifier = specifier.replace(/@modules/, import.meta.dirname);
  }

  specifier = specifier.replace(/\.js$/, EXTENSION);

  return nextResolve(specifier, context);
};

export const load: LoadHook = (url, context, nextLoad) => {
  return nextLoad(url, context);
};
