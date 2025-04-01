import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import * as dotenv from "dotenv";
import { injectable, singleton } from "tsyringe";
import { EnvironmentVariables } from "./EnvironmentVariables";

dotenv.config();

export const CONFIG = Symbol("CONFIG");

@injectable()
@singleton()
export class Config {
  private readonly config: EnvironmentVariables;

  constructor() {
    this.config = validateEnvs(process.env);
  }

  get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] {
    return this.config[key];
  }

  getOrThrow<K extends keyof EnvironmentVariables>(
    key: K
  ): EnvironmentVariables[K] {
    const value = this.get(key);
    if (value === undefined) {
      throw new Error(`Configuration key "${String(key)}" is undefined`);
    }
    return value;
  }

  getAll(): EnvironmentVariables {
    return this.config;
  }
}

export function validateEnvs(envs: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, envs, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true,
    skipUndefinedProperties: true,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
