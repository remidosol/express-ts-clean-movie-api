import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";
import { BadRequestExceptionMessages } from "../../../constants/exception-messages";
import { DirectorValidationMessages } from "../../../constants/validation-messages";

export class CreateDirectorDto {
  /**
   * First name of the director
   * @example "Steven"
   */
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: DirectorValidationMessages.PROVIDE_FIRST_NAME })
  firstName!: string;

  /**
   * Last name of the director
   * @example "Spielberg"
   */
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: DirectorValidationMessages.PROVIDE_SECOND_NAME })
  secondName!: string;

  /**
   * Date of birth of the director
   * @example "1946-12-18T00:00:00.000Z"
   */
  @IsDate({ message: DirectorValidationMessages.INVALID_BIRTH_DATE })
  @Type(() => Date)
  @IsNotEmpty({ message: DirectorValidationMessages.PROVIDE_BIRTH_DATE })
  birthDate!: Date;

  /**
   * Biography of the director
   * @example "Steven Spielberg is an American filmmaker. He is considered one of the founding pioneers of the New Hollywood era."
   */
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: DirectorValidationMessages.PROVIDE_BIO })
  bio!: string;
}
