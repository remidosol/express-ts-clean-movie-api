import { Type } from "class-transformer";
import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { BadRequestExceptionMessages } from "../../../constants/exception-messages";
import { MovieValidationMessages } from "../../../constants/validation-messages";

export class CreateMovieDto {
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_TITLE })
  title!: string;

  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_DESCRIPTION })
  description!: string;

  @IsDate({ message: MovieValidationMessages.INVALID_RELEASE_DATE })
  @Type(() => Date)
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_RELEASE_DATE })
  releaseDate!: Date;

  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_GENRE })
  genre!: string;

  @IsNumber({}, { message: BadRequestExceptionMessages.PROVIDE_NUMBER })
  @Min(0)
  @Max(10)
  @IsOptional()
  rating?: number = 0;

  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_IMDB_ID })
  imdbId!: string;

  @IsMongoId({ message: BadRequestExceptionMessages.INVALID_ID })
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_DIRECTOR })
  director!: string;
}
