import { createClient } from "@redis/client";
import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { RedisStore as RateLimitRedisStore } from "rate-limit-redis";
import { inject, injectable, singleton } from "tsyringe";
import { CACHE, Cache } from "../cache/cache";
import { CONFIG, Config } from "../config";
import { LOGGER, Logger } from "../logger/Logger";

@injectable()
@singleton()
export class RateLimiterMiddleware {
  private defaultLimiter: any;
  private writeOperationsLimiter: any;
  private readonly useRedis: boolean;
  private redisClient: any = null;

  constructor(
    @inject(CONFIG) private readonly config: Config,
    @inject(LOGGER) private readonly logger: Logger,
    @inject(CACHE) private readonly cache: Cache
  ) {
    this.logger.setOrganizationAndContext("RateLimiterMiddleware");
    this.useRedis = this.cache.isUsingRedis();
    this.initialize();
  }

  private async initialize() {
    try {
      // Get rate limit configuration
      const defaultWindowMs = +(
        this.config.get("DEFAULT_RATE_LIMIT_TTL") || 60000
      );
      const defaultMax = +(this.config.get("DEFAULT_RATE_LIMIT_LIMIT") || 250);
      const writeWindowMs = +(
        this.config.get("POST_PATCH_RATE_LIMIT_TTL") || 30000
      );
      const writeMax = +(this.config.get("POST_PATCH_RATE_LIMIT_LIMIT") || 20);

      // Initialize Redis client
      if (this.useRedis) {
        await this.initializeRedisClient();
      }

      // Default rate limiter (for read operations)
      this.defaultLimiter = rateLimit({
        windowMs: defaultWindowMs,
        max: defaultMax,
        standardHeaders: true,
        legacyHeaders: false,
        // Create a unique store for default limiter
        store:
          this.useRedis && this.redisClient
            ? this.createRedisStore("default")
            : undefined,
        keyGenerator: (req: Request) => `${req.ip}-default`,
        handler: (req: Request, res: Response) =>
          this.handleRateLimitExceeded(req, res, "default"),
      });

      // Stricter rate limiter for write operations
      this.writeOperationsLimiter = rateLimit({
        windowMs: writeWindowMs,
        max: writeMax,
        standardHeaders: true,
        legacyHeaders: false,
        // Create a separate store for write operations limiter
        store:
          this.useRedis && this.redisClient
            ? this.createRedisStore("write")
            : undefined,
        keyGenerator: (req: Request) => `${req.ip}-write`,
        handler: (req: Request, res: Response) =>
          this.handleRateLimitExceeded(req, res, "write"),
      });

      this.logger.info(`Rate limiters initialized:
        - Default: ${defaultMax} requests per ${defaultWindowMs / 1000}s
        - Write operations: ${writeMax} requests per ${writeWindowMs / 1000}s
        - Using Redis: ${this.useRedis && !!this.redisClient}`);
    } catch (error: any) {
      this.logger.error("Failed to initialize rate limiters", { error });

      // Fallback to default memory-based limiters
      this.defaultLimiter = rateLimit({ windowMs: 60000, max: 250 });
      this.writeOperationsLimiter = rateLimit({ windowMs: 30000, max: 20 });
    }
  }

  /**
   * Initialize a dedicated Redis client for rate limiting
   */
  private async initializeRedisClient() {
    try {
      // Get Redis connection details - either from env vars or your cache config
      const redisUrl = `redis://${this.config.get("REDIS_USERNAME") || ""}:${
        this.config.get("REDIS_PASSWORD") || ""
      }@${this.config.get("REDIS_HOST")}:${this.config.get(
        "REDIS_PORT"
      )}/${this.config.get("REDIS_DB") || 0}`;

      // Create a dedicated Redis client for rate limiting
      this.redisClient = createClient({ url: redisUrl });

      // Add event listeners for monitoring
      this.redisClient.on("error", (err: any) => {
        this.logger.error("Redis client error", { error: err });
      });

      this.redisClient.on("connect", () => {
        this.logger.info("Redis client connected");
      });

      // Connect to Redis
      await this.redisClient.connect();
      this.logger.info("Redis client initialized for rate limiting");
    } catch (error: any) {
      this.logger.error(
        "Failed to initialize Redis client, falling back to memory store",
        { error }
      );
      this.redisClient = null;
    }
  }

  /**
   * Create a new Redis store with a unique prefix
   */
  private createRedisStore(prefix: string): RateLimitRedisStore | undefined {
    if (!this.redisClient || !this.redisClient.isOpen) {
      this.logger.warn("Redis client not available or closed");
      return undefined;
    }

    try {
      return new RateLimitRedisStore({
        // Use our dedicated Redis client
        sendCommand: async (...args: unknown[]) => {
          return this.redisClient.sendCommand(args as any);
        },
        prefix: `ratelimit:${prefix}:`,
      });
    } catch (error: any) {
      this.logger.error("Failed to create Redis store", { error });
      return undefined;
    }
  }

  /**
   * Handle rate limit exceeded
   */
  private handleRateLimitExceeded(
    req: Request,
    res: Response,
    limiterType: string
  ) {
    this.logger.warn(`Rate limit exceeded (${limiterType})`, {
      props: {
        ip: req.ip,
        path: req.path,
        method: req.method,
        limiterType,
      },
    });

    res.status(429).json({
      error: {
        statusCode: 429,
        name: "TooManyRequestsError",
        message: "Too many requests, please try again later.",
      },
    });
  }

  /**
   * Method-based rate limiter middleware
   */
  handle() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Skip rate limiting for certain paths if needed
      if (this.shouldSkipRateLimit(req)) {
        return next();
      }

      // Apply stricter limits to write operations
      if (["POST", "PUT", "PATCH"].includes(req.method)) {
        return this.writeOperationsLimiter(req, res, next);
      }

      // Default limits for read operations
      return this.defaultLimiter(req, res, next);
    };
  }

  /**
   * Check if rate limiting should be skipped for certain paths
   */
  private shouldSkipRateLimit(req: Request): boolean {
    // Skip health check routes, etc.
    const skipPaths = ["/health", "/metrics", "/api-docs"];
    return skipPaths.some((path) => req.path.includes(path));
  }

  /**
   * Create custom rate limiter for specific endpoints
   */
  createCustomLimiter(options: {
    windowMs: number;
    max: number;
    keyPrefix: string;
  }) {
    return rateLimit({
      windowMs: options.windowMs,
      max: options.max,
      standardHeaders: true,
      // Create a new store with unique prefix for each custom limiter
      store:
        this.useRedis && this.redisClient && this.redisClient.isOpen
          ? this.createRedisStore(options.keyPrefix)
          : undefined,
      keyGenerator: (req: Request) => `${req.ip}-${options.keyPrefix}`,
      handler: (req: Request, res: Response) =>
        this.handleRateLimitExceeded(req, res, options.keyPrefix),
    });
  }

  /**
   * Close Redis connection when shutting down
   */
  async close() {
    if (this.redisClient && this.redisClient.isOpen) {
      await this.redisClient.quit();
      this.logger.info("Rate limiter Redis connection closed");
    }
  }
}
