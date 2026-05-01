import type { Config } from '../config/config.js';
import type { Logger } from '../logger/logger.js';
import type { Router } from '../router.js';

export interface Ctx {
  router: Router;
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
  enabled?: boolean;
  main?: string;
}

export interface ModMain {
  register(ctx: Ctx): Promise<void>;
}
