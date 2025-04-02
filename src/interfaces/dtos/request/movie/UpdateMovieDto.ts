import { Type } from "class-transformer";
import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateIf,
} from "class-validator";
import { BadRequestExceptionMessages } from "../../../constants/exception-messages";
import { MovieValidationMessages } from "../../../constants/validation-messages";

export class UpdateMovieDto {
  /**
   * Title of the movie
   * @example "Pulp Fiction"
   */
  @ValidateIf(
    (dto: UpdateMovieDto) => dto.title !== undefined && dto.title !== null
  )
  @IsString({ message: "title: " + BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_TITLE })
  title?: string;

  /**
   * Description of the movie plot
   * @example "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine."
   */
  @ValidateIf(
    (dto: UpdateMovieDto) =>
      dto.description !== undefined && dto.description !== null
  )
  @IsString({
    message: "description: " + BadRequestExceptionMessages.PROVIDE_STRING,
  })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_DESCRIPTION })
  description?: string;

  /**
   * Release date of the movie
   * @example "1994-10-14T00:00:00.000Z"
   */
  @ValidateIf(
    (dto: UpdateMovieDto) =>
      dto.releaseDate !== undefined && dto.releaseDate !== null
  )
  @IsDate({
    message: "releaseDate: " + MovieValidationMessages.INVALID_RELEASE_DATE,
  })
  @Type(() => Date)
  releaseDate?: Date;

  /**
   * Genre of the movie
   * @example "Crime"
   */
  @ValidateIf(
    (dto: UpdateMovieDto) => dto.genre !== undefined && dto.genre !== null
  )
  @IsString({ message: "genre: " + BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_GENRE })
  genre?: string;

  /**
   * Rating of the movie (0-10)
   * @example 8.9
   */
  @ValidateIf(
    (dto: UpdateMovieDto) => dto.rating !== undefined && dto.rating !== null
  )
  @Min(0, { message: MovieValidationMessages.RATING_RANGE })
  @Max(10, { message: MovieValidationMessages.RATING_RANGE })
  @IsNumber(
    {},
    { message: "rating: " + BadRequestExceptionMessages.PROVIDE_NUMBER }
  )
  @Type(() => Number)
  rating?: number;

  /**
   * IMDB identifier of the movie
   * @example "tt0110912"
   */
  @ValidateIf(
    (dto: UpdateMovieDto) => dto.imdbId !== undefined && dto.imdbId !== null
  )
  @IsString({
    message: "imdbId: " + BadRequestExceptionMessages.PROVIDE_STRING,
  })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_IMDB_ID })
  imdbId?: string;

  /**
   * Director's unique identifier
   * @example "507f1f77bcf86cd799439012"
   */
  @ValidateIf(
    (dto: UpdateMovieDto) => dto.director !== undefined && dto.director !== null
  )
  @IsMongoId({ message: BadRequestExceptionMessages.INVALID_ID })
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  director?: string;
}
