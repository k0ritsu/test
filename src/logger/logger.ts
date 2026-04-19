export type Level = keyof typeof Level;
export const Level = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
} as const;

interface Config {
  level: Level;
}

interface Handler {
  (lvl: Level, msg: string, ...args: unknown[]): void;
}

export type Logger = ReturnType<typeof createLogger>;

export function createLogger(handler: Handler) {
  return {
    debug(msg: string, ...args: unknown[]) {
      handler('debug', msg, ...args);
    },
    info(msg: string, ...args: unknown[]) {
      handler('info', msg, ...args);
    },
    warn(msg: string, ...args: unknown[]) {
      handler('warn', msg, ...args);
    },
    error(msg: string, ...args: unknown[]) {
      handler('error', msg, ...args);
    }
  };
}

export function createJsonHandler(config: Config): Handler {
  return (lvl, msg, ...args) => {
    if (Level[lvl] < Level[config.level]) {
      return;
    }

    const attrs: Record<string, unknown> = {};

    for (let i = 0; i < args.length; i += 2) {
      const key = args[i];
      const val = args[i + 1];

      if (typeof key === 'string') {
        attrs[key] = val;
      }
    }

    const log = JSON.stringify({
      ...attrs,
      lvl,
      time: new Date().toISOString(),
      msg
    });

    process.stdout.write(`${log}\n`);
  };
}

export function createTextHandler(config: Config): Handler {
  return (lvl, msg, ...args) => {
    if (Level[lvl] < Level[config.level]) {
      return;
    }

    const attrs: string[] = [];

    for (let i = 0; i < args.length; i += 2) {
      const key = args[i];
      const val = args[i + 1];

      if (typeof key === 'string') {
        attrs.push(`${key}=${JSON.stringify(val)}`);
      }
    }

    const log = [
      new Date().toISOString(),
      `[${lvl}]`,
      msg,
      attrs.length > 0 ? ' ' + attrs.join(' ') : ''
    ].join('\t');

    process.stdout.write(`${log}\n`);
  };
}
