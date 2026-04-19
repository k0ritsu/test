import type { Config } from '../config/types.ts';
import type { Logger } from '../logger/types.ts';
import type { Router } from '../router.ts';

export interface Context {
  config: Config;
  logger: Logger;
  modules: Array<
    Omit<Mod, 'main'> & {
      main: ModMain;
    }
  >;
}

export interface Mod {
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  main: string;
}

export interface ModMain {
  register(context: Context): Promise<{
    router?: Router;
  }>;
}
