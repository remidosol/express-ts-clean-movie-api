import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { ValidationException } from "../../../infrastructure/exception";

export function validationMiddleware(
  type: any,
  location: "body" | "query" | "params" = "body"
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const source = req[location];
    if (!source) {
      return next();
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
  };
}
