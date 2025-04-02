import { Response } from "express";
import { InternalServerErrorExceptionMessages } from "../../constants/exception-messages";

export class HttpResponse {
  static ok(res: Response, data: any): Response {
    return res.status(200).json(data);
  }

  static created(res: Response, data: any): Response {
    return res.status(201).json(data);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static badRequest(res: Response, message: string = "Bad request"): Response {
    return res.status(400).json({
      statusCode: 400,
      message,
      error: "Bad Request",
    });
  }

  static unauthorized(
    res: Response,
    message: string = "Unauthorized"
  ): Response {
    return res.status(401).json({
      statusCode: 401,
      message,
      error: "Unauthorized",
    });
  }

  static forbidden(res: Response, message: string = "Forbidden"): Response {
    return res.status(403).json({
      statusCode: 403,
      message,
      error: "Forbidden",
    });
  }

  static notFound(res: Response, message: string = "Not found"): Response {
    return res.status(404).json({
      statusCode: 404,
      message,
      error: "Not Found",
    });
  }

  static conflict(res: Response, message: string = "Conflict"): Response {
    return res.status(409).json({
      statusCode: 409,
      message,
      error: "Conflict",
    });
  }

  static internalServerError(
    res: Response,
    message: string = InternalServerErrorExceptionMessages.SOMETHING_WENT_WRONG
  ): Response {
    return res.status(500).json({
      statusCode: 500,
      message,
      error: "Internal Server Error",
    });
  }

  static handleError(res: Response, error: any): Response {
    // You can extend this to handle different types of errors and map them to appropriate HTTP status codes
    if (error.name === "ValidationError") {
      return this.badRequest(res, error.message);
    }

    if (error.name === "NotFoundError") {
      return this.notFound(res, error.message);
    }

    if (error.name === "UnauthorizedError") {
      return this.unauthorized(res, error.message);
    }

    if (error.name === "ForbiddenError") {
      return this.forbidden(res, error.message);
    }

    if (error.name === "ConflictError") {
      return this.conflict(res, error.message);
    }

    return this.internalServerError(res);
  }
}
