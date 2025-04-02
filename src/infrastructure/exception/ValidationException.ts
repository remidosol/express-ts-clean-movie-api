import { ValidationError } from "class-validator";

export class ValidationException extends Error {
  public statusCode: number;

  constructor(public validationErrors: ValidationError[]) {
    super("Validation failed");
    this.name = "ValidationException";
    this.statusCode = 400;
  }
}
