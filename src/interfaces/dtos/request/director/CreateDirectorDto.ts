import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";
import { BadRequestExceptionMessages } from "../../../constants/exception-messages";
import { DirectorValidationMessages } from "../../../constants/validation-messages";

export class CreateDirectorDto {
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: DirectorValidationMessages.PROVIDE_FIRST_NAME })
  firstName!: string;

  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: DirectorValidationMessages.PROVIDE_SECOND_NAME })
  secondName!: string;

  @IsDate({ message: DirectorValidationMessages.INVALID_BIRTH_DATE })
  @Type(() => Date)
  @IsNotEmpty({ message: DirectorValidationMessages.PROVIDE_BIRTH_DATE })
  birthDate!: Date;

  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: DirectorValidationMessages.PROVIDE_BIO })
  bio!: string;
}
