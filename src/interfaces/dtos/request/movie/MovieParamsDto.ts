import { IsMongoId, IsNotEmpty } from "class-validator";
import { BadRequestExceptionMessages } from "../../../constants/exception-messages";
import { MovieValidationMessages } from "../../../constants/validation-messages";

export class MovieParamsDto {
  @IsMongoId({ message: BadRequestExceptionMessages.INVALID_ID })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_ID })
  id!: string;
}
