import { IsEnum, IsOptional, IsString } from "class-validator";

export enum Environment {
  Development = "development",
  Staging = "staging",
  Production = "production",
  Test = "test",
}

export class EnvironmentVariables {
  @IsString()
  HOST!: string;

  @IsString()
  PORT!: string;

  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsString()
  @IsOptional()
  DEBUG?: "true" | "false";

  @IsString()
  APP_NAME!: string;

  @IsString()
  REQUEST_ID_HEADER_NAME!: string;

  @IsString()
  RESPONSE_TIME_HEADER_NAME!: string;

  // MongoDB
  @IsString()
  DATABASE_URL!: string;

  // Throttler
  @IsString()
  @IsOptional()
  DEFAULT_THROTTLE_TTL?: string;

  @IsString()
  @IsOptional()
  DEFAULT_THROTTLE_LIMIT?: string;

  @IsString()
  @IsOptional()
  POST_PATCH_THROTTLE_TTL?: string;

  @IsString()
  @IsOptional()
  POST_PATCH_THROTTLE_LIMIT?: string;

  // Cache
  @IsString()
  REDIS_HOST?: string;

  @IsString()
  @IsOptional()
  REDIS_PORT?: string;

  @IsString()
  @IsOptional()
  REDIS_DB?: string;

  @IsString()
  @IsOptional()
  REDIS_USERNAME?: string;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  @IsOptional()
  MAX_ITEM_IN_CACHE?: string;

  @IsString()
  @IsOptional()
  CACHE_TTL?: string;

  constructor(envs?: Record<string, unknown>) {
    Object.assign(this, envs);
  }
}
