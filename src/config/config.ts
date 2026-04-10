import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

const Config = Type.Object({
  APP_NAME: Type.String(),
  APP_VERSION: Type.String(),
  PORT: Type.Number({
    default: 3000
  }),
  USE_PARALLELISM: Type.Boolean({
    default: true
  })
});

export type Config = ReturnType<typeof loadConfig>;

export function loadConfig() {
  return Value.Parse(Config, process.env);
}
