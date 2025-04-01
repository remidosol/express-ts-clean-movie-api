import { ValidationError } from "class-validator";

export class ValidationException extends Error {
  constructor(public validationErrors: ValidationError[]) {
    super("Validation failed");
    this.name = "ValidationException";
  }
}
