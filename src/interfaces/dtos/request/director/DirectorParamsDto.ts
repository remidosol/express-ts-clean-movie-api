import { IsMongoId, IsNotEmpty } from "class-validator";
import { BadRequestExceptionMessages } from "../../../constants/exception-messages";
import { DirectorValidationMessages } from "../../../constants/validation-messages";

export class DirectorParamsDto {
  /**
   * Director's unique identifier
   * @example "507f1f77bcf86cd799439012"
   */
  @IsMongoId({ message: BadRequestExceptionMessages.INVALID_ID })
  @IsNotEmpty({ message: DirectorValidationMessages.PROVIDE_ID })
  id!: string;
}
