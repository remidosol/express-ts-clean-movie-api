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
    this.ttl = parseInt(this.config.get("CACHE_TTL") || "600000", 10); // Default to 10 minutes
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
          namespace: "clean_movie_api",
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
      namespace: "clean_movie_api",
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
   * Get the underlying Redis client if available
   * @returns The Redis client or null if not using Redis
   */
  getRedisClient(): any | null {
    if (!this.isUsingRedis()) {
      return null;
    }

    const keyv = this.getStore();
    const store = keyv.opts?.store as any;

    if (store) {
      return store._redis || store.client || store.redis || null;
    }

    return null;
  }

  /**
   * Clear the entire cache
   */
  async clear(): Promise<void> {
    return this.cacheStore.clear();
  }
}
