import { register } from 'node:module';
import { extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const EXTENSION = extname(import.meta.filename);

const specifier = resolve(import.meta.dirname, `loader${EXTENSION}`);
register(specifier, pathToFileURL('.'));
