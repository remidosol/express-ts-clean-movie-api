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
  ValidateIf,
} from "class-validator";
import { BadRequestExceptionMessages } from "../../../constants/exception-messages";
import { MovieValidationMessages } from "../../../constants/validation-messages";

export class CreateMovieDto {
  /**
   * Title of the movie
   * @example "The Godfather"
   */
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_TITLE })
  title!: string;

  /**
   * Description of the movie plot
   * @example "The aging patriarch of an organized crime dynasty transfers control to his reluctant son."
   */
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_DESCRIPTION })
  description!: string;

  /**
   * Release date of the movie
   * @example "1972-03-24T00:00:00.000Z"
   */
  @IsDate({ message: MovieValidationMessages.INVALID_RELEASE_DATE })
  @Type(() => Date)
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_RELEASE_DATE })
  releaseDate!: Date;

  /**
   * Genre of the movie
   * @example "Crime"
   */
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_GENRE })
  genre!: string;

  /**
   * Rating of the movie (0-10)
   * @example 9.2
   */
  @Min(0)
  @Max(10)
  @IsNumber({}, { message: BadRequestExceptionMessages.PROVIDE_NUMBER })
  @Type(() => Number)
  @ValidateIf(
    (dto: CreateMovieDto) => dto.rating !== undefined && dto.rating !== null
  )
  @IsOptional()
  rating?: number = 0;

  /**
   * IMDB identifier of the movie
   * @example "tt0068646"
   */
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_IMDB_ID })
  imdbId!: string;

  /**
   * Director's unique identifier
   * @example "507f1f77bcf86cd799439012"
   */
  @IsMongoId({ message: BadRequestExceptionMessages.INVALID_ID })
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_DIRECTOR })
  director!: string;
}
