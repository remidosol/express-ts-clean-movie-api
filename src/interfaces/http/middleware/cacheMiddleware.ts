import { NextFunction, Request, Response } from "express";
import { container } from "tsyringe";
import { CACHE, Cache } from "../../../infrastructure/cache/cache";
import { LOGGER, Logger } from "../../../infrastructure/logger/Logger";

type KeyGenerator = (req: Request) => string;

interface CacheOptions {
  /** Custom key or function to generate a key */
  key?: string | KeyGenerator;
  /** Custom TTL in milliseconds (overrides default cache TTL) */
  ttl?: number;
}

/**
 * Creates a middleware that caches API responses
 *
 * @param options Cache configuration options
 * @returns Express middleware function
 */
export const cacheMiddleware = async (options: CacheOptions = {}) => {
  const logger = container.resolve<Logger>(LOGGER);
  logger.setOrganizationAndContext("CacheMiddleware");

  const cache = container.resolve<Cache>(CACHE);
  const cacheStore = cache.getStore();

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      next();
      return;
    }

    // Generate cache key
    const cacheKey =
      typeof options.key === "function"
        ? options.key(req)
        : options.key || `${req.originalUrl || req.url}`;

    try {
      // Check if we have a cache hit
      const cachedResponse = await cacheStore.get(cacheKey);

      if (cachedResponse) {
        logger.debug(
          `Cache hit for key: ${cacheKey}, response: ${JSON.stringify(
            cachedResponse,
            null,
            2
          )}`
        );

        // Return cached response
        res.status(200).json({
          ...cachedResponse,
        });

        return;
      }

      // Store original response methods
      const originalSend = res.send;
      const originalJson = res.json;

      // Override response methods to cache the response
      res.send = function (body): Response {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const responseBody =
            typeof body === "string" ? JSON.parse(body) : body;
          cacheStore.set(cacheKey, responseBody, options.ttl || cache.getTtl());
        }
        return originalSend.call(this, body);
      };

      res.json = function (body): Response {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheStore.set(cacheKey, body, options.ttl || cache.getTtl());
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};
