import KeyvRedis, { RedisClientOptions } from "@keyv/redis";
import Keyv from "keyv";
import { inject, injectable, singleton } from "tsyringe";
import { CONFIG, Config } from "../config/Config";

export const CACHE = Symbol("CACHE");

@injectable()
@singleton()
export class Cache {
  private readonly cacheStore: Keyv;
  private readonly ttl: number;

  constructor(@inject(CONFIG) private readonly config: Config) {
    this.ttl = parseInt(this.config.get("CACHE_TTL") || "3600000", 10);
    this.cacheStore = this.createCacheStore();
  }

  /**
   * Creates the cache store instance with Redis if credentials are available,
   * otherwise falls back to in-memory cache
   */
  private createCacheStore(): Keyv {
    try {
      const redisHost = this.config.get("REDIS_HOST");
      const redisPort = this.config.get("REDIS_PORT");
      const redisUsername = this.config.get("REDIS_USERNAME");
      const redisPassword = this.config.get("REDIS_PASSWORD");
      const redisDb = this.config.get("REDIS_DB");

      if (redisHost && redisPort) {
        const keyvRedisOptions: RedisClientOptions = {
          username: redisUsername,
          password: redisPassword,
          socket: {
            host: redisHost,
            port: parseInt(redisPort, 10),
          },
          database: redisDb ? parseInt(redisDb, 10) : 0,
        };

        // Create Redis store
        return new Keyv({
          store: new KeyvRedis(keyvRedisOptions),
          namespace: this.config.get("APP_NAME"),
          ttl: this.ttl,
        });
      }
    } catch (error) {
      console.warn(
        "Failed to initialize Redis cache, falling back to memory cache",
        error
      );
    }

    // Fallback to in-memory store
    return new Keyv({
      namespace: this.config.get("APP_NAME"),
      ttl: this.ttl,
    });
  }

  /**
   * Get the KeyV instance
   */
  getStore(): Keyv {
    return this.cacheStore;
  }

  /**
   * Get cache TTL in milliseconds
   */
  getTtl(): number {
    return this.ttl;
  }

  /**
   * Utility method to check if Redis is being used
   */
  isUsingRedis(): boolean {
    return this.cacheStore.opts?.store instanceof KeyvRedis;
  }

  /**
   * Clear the entire cache
   */
  async clear(): Promise<void> {
    return this.cacheStore.clear();
  }
}
