export interface Mod {
  name: string;
  version: string;
}

export interface Modlock {
  [mod: string]: Mod & {
    dependencies: Modlock;
  };
}

export interface Modrc {
  registry: string;
}
