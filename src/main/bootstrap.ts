import "reflect-metadata";
import { Express } from "express";
import mongoose from "mongoose";
import { CONFIG, Config } from "../infrastructure/config";
import { container } from "../infrastructure/di/container";
import { LOGGER, Logger } from "../infrastructure/logger/Logger";
import { SwaggerDocs } from "../infrastructure/swagger";
import { setupMiddlewareAndRoutes } from "./setup";

export async function bootstrap(app: Express): Promise<void> {
  try {
    // Initialize configuration
    const config = container.resolve<Config>(CONFIG);
    const logger = container.resolve<Logger>(LOGGER);
    logger.setOrganizationAndContext("Bootstrap");

    // Set up Swagger Documentation
    const swaggerDocs = container.resolve<SwaggerDocs>(SwaggerDocs.name);
    swaggerDocs.setup(app);
    logger.info("Swagger documentation configured successfully");

    // Configure middleware
    await setupMiddlewareAndRoutes(app);
    logger.info("Middlewares and routes configured successfully");

    // Initialize database connections
    await mongoose.connect(config.getOrThrow("DATABASE_URL"));
    mongoose.set("debug", config.getOrThrow("DEBUG") === "true");
    logger.info("MongoDB connected successfully");

    logger.info("Application bootstrapped successfully");
  } catch (error: any) {
    const logger = container.resolve<Logger>(LOGGER);
    logger.error("Failed to bootstrap application", { error });
    throw error;
  }
}
