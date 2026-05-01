export interface Mod {
  name: string;
  version: string;
  enabled?: boolean;
  main?: string;
  dependencies: {
    [mod: Mod['name']]: Mod['version'];
  };
}

export interface Modlock {
  [mod: Mod['name']]: {
    dependencies: Modlock;
    name: Mod['name'];
    version: Mod['version'];
  };
}

export interface Modrc {
  registry: string;
}
