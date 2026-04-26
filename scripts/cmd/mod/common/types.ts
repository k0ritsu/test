export type Version = string;

export interface Mod {
  dependencies: {
    [mod: string]: Version;
  };
  name: string;
  version: string;
}

export interface Modlock {
  [mod: string]: Omit<Mod, 'dependencies'> & {
    dependencies: Modlock;
  };
}

export interface Modrc {
  registry: string;
}
