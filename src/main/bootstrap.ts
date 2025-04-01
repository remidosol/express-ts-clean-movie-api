import "reflect-metadata";
import dotenv from "dotenv";
import { Express } from "express";
import mongoose from "mongoose";
import { CONFIG, Config } from "../infrastructure/config";
import { container } from "../infrastructure/di/container";
import { LOGGER, Logger } from "../infrastructure/logger/Logger";
import { setupMiddleware } from "./middleware";
import { registerRoutes } from "./routes";

dotenv.config();

export async function bootstrap(app: Express): Promise<void> {
  try {
    // Initialize configuration
    const config = container.resolve<Config>(CONFIG);
    const logger = container.resolve<Logger>(LOGGER);
    logger.setOrganizationAndContext("Bootstrap");

    // Configure middleware
    setupMiddleware(app);
    logger.info("Middleware configured successfully");

    // Register all routes
    registerRoutes(app);
    logger.info("Routes registered successfully");

    // Initialize database connections
    await mongoose.connect(config.getOrThrow("DATABASE_URL"));
    logger.info("MongoDB connected successfully");

    logger.info("Application bootstrapped successfully");
  } catch (error: any) {
    const logger = container.resolve<Logger>(LOGGER);
    logger.error("Failed to bootstrap application", { error });
    throw error;
  }
}
