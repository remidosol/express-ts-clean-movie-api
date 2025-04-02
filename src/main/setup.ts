import { ClassTransformOptions, instanceToPlain } from "class-transformer";
import { useContainer } from "class-validator";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import responseTime from "response-time";
import { CONFIG, Config } from "../infrastructure/config";
import { container } from "../infrastructure/di/container";
import { LOGGER, Logger } from "../infrastructure/logger/Logger";
import { RateLimiterMiddleware } from "../infrastructure/middleware";
import {
  errorHandlerMiddleware,
  requestIdMiddleware,
} from "../interfaces/http/middleware";
import { sanitizeObject } from "../shared/utils";
import { registerRoutes } from "./routes";

export async function setupMiddlewareAndRoutes(app: Express): Promise<void> {
  const config = container.resolve<Config>(CONFIG);
  const logger = container.resolve<Logger>(LOGGER);
  logger.setOrganizationAndContext("Bootstrap");

  if (config.getOrThrow("NODE_ENV") !== "test") {
    const rateLimiter = container.resolve<RateLimiterMiddleware>(
      RateLimiterMiddleware
    );
    app.use(rateLimiter.handle());
    logger.info("Rate limiter middleware applied");
  }

  app.use(express.json({ limit: "15mb" }));
  app.use(helmet());
  app.use(cors());
  app.use(requestIdMiddleware(config));

  // XSS protection
  app.use((req, _res, next) => {
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);
    next();
  });

  // Response time headers
  app.use(
    responseTime({
      digits: 3,
      header: config.getOrThrow("RESPONSE_TIME_HEADER_NAME"),
      suffix: true,
    })
  );

  // Class validator container setup
  useContainer(
    {
      get(dtoClass) {
        return container.resolve(dtoClass);
      },
    },
    { fallbackOnErrors: true }
  );

  // Register all routes
  await registerRoutes(app);
  logger.info("Routes registered successfully");

  // Class transformer setup
  const transformOptions: ClassTransformOptions = {
    excludeExtraneousValues: true,
  };

  app.use((_req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      return originalJson.call(
        this,
        data && typeof data === "object"
          ? instanceToPlain(data, transformOptions)
          : data
      );
    };
    next();
  });

  // Error handling should be last
  app.use(errorHandlerMiddleware);
}
