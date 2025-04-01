import { IsMongoId, IsNotEmpty } from "class-validator";
import { BadRequestExceptionMessages } from "../../../constants/exception-messages";
import { DirectorValidationMessages } from "../../../constants/validation-messages";

export class DirectorParamsDto {
  @IsMongoId({ message: BadRequestExceptionMessages.INVALID_ID })
  @IsNotEmpty({ message: DirectorValidationMessages.PROVIDE_ID })
  id!: string;
}
