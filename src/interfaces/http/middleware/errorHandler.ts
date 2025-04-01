import { NextFunction, Request, Response } from "express";
import { MongooseError } from "mongoose";
import { container } from "tsyringe";
import { ValidationException } from "../../../infrastructure/exception";
import { LOGGER, Logger } from "../../../infrastructure/logger/Logger";

export async function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const logger = container.resolve<Logger>(LOGGER);
  logger.setOrganizationAndContext("GlobalErrorHandler");

  // Handle validation errors
  if (err instanceof ValidationException) {
    logger.warn(`Validation error: ${req.method} ${req.path}`, { error: err });

    res.status(400).json({
      statusCode: 400,
      message: "Validation failed",
      errors: err.validationErrors,
    });
    return;
  }

  // Handle other known error types
  if (err instanceof MongooseError) {
    logger.warn(`Mongoose error: ${req.method} ${req.path}`, { error: err });

    res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
    });
    return;
  }

  // Fallback for unknown errors
  logger.error(`Unhandled error: ${err.message}`, {
    error: err,
  });

  res.status(500).json({
    statusCode: 500,
    message: "Internal server error",
  });
  return;
}
