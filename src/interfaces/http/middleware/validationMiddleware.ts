import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { container } from "../../../infrastructure/di/container";
import { ValidationException } from "../../../infrastructure/exception";
import { LOGGER, Logger } from "../../../infrastructure/logger/Logger";

export function validationMiddleware(
  type: any,
  location: "body" | "query" | "params" = "body"
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const logger = container.resolve<Logger>(LOGGER);
    logger.setOrganizationAndContext("ValidationMiddleware");

    try {
      const source = req[location];

      if (!source) {
        return next(
          new ValidationException([
            { property: "all", constraints: { message: "No data provided" } },
          ])
        );
      }

      const object = plainToInstance(type, source);
      const errors = await validate(object, {
        whitelist: true,
        skipMissingProperties: true,
        skipUndefinedProperties: true,
      });

      if (errors.length > 0) {
        return next(new ValidationException(errors));
      }

      // Replace request data with validated object
      req[location] = object;
      next();
    } catch (error: any) {
      logger.error(`Validation error: ${req.method} ${req.path}`, {
        error,
        props: {
          body: req.body,
          params: req.params,
          query: req.query,
        },
      });
      next(error); // Make sure we pass any errors to the next middleware
    }
  };
}
