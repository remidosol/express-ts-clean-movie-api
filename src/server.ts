import "reflect-metadata";
import { Server } from "http";
import mongoose from "mongoose";
import { CACHE, Cache } from "./infrastructure/cache";
import { CONFIG, Config } from "./infrastructure/config";
import { container } from "./infrastructure/di/container";
import { LOGGER, Logger } from "./infrastructure/logger/Logger";
import { RateLimiterMiddleware } from "./infrastructure/middleware";
import { app } from "./main/app";
import { bootstrap } from "./main/bootstrap";

async function startServer() {
  const logger = container.resolve<Logger>(LOGGER);
  logger.setOrganizationAndContext("Server");

  try {
    await bootstrap(app);

    const cache = container.resolve<Cache>(CACHE);
    const config = container.resolve<Config>(CONFIG);
    const PORT = config.getOrThrow("PORT");

    const server = app.listen(+PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(
        `Swagger docs available at http://localhost:${PORT}/api-docs`
      );
    });

    // Handle termination signals
    process.on("SIGTERM", () => shutdown("SIGTERM", server, cache, logger));
    process.on("SIGINT", () => shutdown("SIGINT", server, cache, logger));
  } catch (error: any) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
}

/**
 * Handles graceful shutdown of the server
 * @param signal The signal that triggered the shutdown
 */
const shutdown = async (
  signal: string,
  server: Server,
  cache: Cache,
  logger: Logger
): Promise<void> => {
  logger.info(`${signal} signal received. Starting graceful shutdown...`);

  // Set a timeout to force exit if graceful shutdown takes too long
  const forceExitTimeout = setTimeout(() => {
    logger.error("Graceful shutdown timed out after 10s, forcing exit");
    process.exit(1);
  }, 10000);

  try {
    // Close server first (stop accepting new connections)
    logger.debug("Closing HTTP server...");
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    logger.debug("HTTP server closed successfully");

    // Clear cache
    logger.debug("Clearing cache...");
    await cache.clear();
    logger.debug("Cache cleared successfully");

    // Close rate limiter Redis connection
    try {
      const rateLimiter = container.resolve<RateLimiterMiddleware>(
        RateLimiterMiddleware
      );
      await rateLimiter.close();
    } catch (error: any) {
      logger.error("Error closing rate limiter", { error });
    }

    // Disconnect from database
    logger.debug("Closing database connections...");
    await mongoose.disconnect();
    logger.debug("Database connections closed successfully");

    // Cancel the force exit timeout
    clearTimeout(forceExitTimeout);

    logger.debug("Graceful shutdown completed");
    process.exit(0);
  } catch (error: any) {
    logger.error("Error during graceful shutdown", { error });
    clearTimeout(forceExitTimeout);
    process.exit(1);
  }
};

startServer();
