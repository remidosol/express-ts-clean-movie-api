import { IsMongoId, IsNotEmpty } from "class-validator";
import { BadRequestExceptionMessages } from "../../../constants/exception-messages";
import { MovieValidationMessages } from "../../../constants/validation-messages";

export class MovieParamsDto {
  /**
   * Movie's unique identifier
   * @example "507f1f77bcf86cd799439011"
   */
  @IsMongoId({ message: BadRequestExceptionMessages.INVALID_ID })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_ID })
  id!: string;
}
