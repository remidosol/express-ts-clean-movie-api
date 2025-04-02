import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateIf,
} from "class-validator";
import { Movie } from "../../../../domain/entities";
import { BadRequestExceptionMessages } from "../../../constants/exception-messages";
import { MovieValidationMessages } from "../../../constants/validation-messages";

export class MovieQueryDto {
  /**
   * Optional title filter for movies
   * @example "Inception"
   */
  @ValidateIf(
    (dto: MovieQueryDto) => dto.title !== undefined && dto.title !== null
  )
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  title?: string;

  /**
   * Optional genre filter for movies
   * @example "Sci-Fi"
   */
  @ValidateIf(
    (dto: MovieQueryDto) => dto.genre !== undefined && dto.genre !== null
  )
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  genre?: string;

  /**
   * Optional minimum rating filter for movies
   * @example 8.5
   */
  @ValidateIf(
    (dto: MovieQueryDto) => dto.rating !== undefined && dto.rating !== null
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
   * Optional release date filter for movies
   * @example "2010-07-16T00:00:00.000Z"
   */
  @ValidateIf(
    (dto: MovieQueryDto) =>
      dto.releaseDate !== undefined && dto.releaseDate !== null
  )
  @IsDate({
    message: "releaseDate: " + MovieValidationMessages.INVALID_RELEASE_DATE,
  })
  @Type(() => Date)
  releaseDate?: Date;

  /**
   * Optional director ID filter for movies
   * @example "507f1f77bcf86cd799439012"
   */
  @ValidateIf(
    (dto: MovieQueryDto) => dto.director !== undefined && dto.director !== null
  )
  @IsMongoId({ message: BadRequestExceptionMessages.INVALID_ID })
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  director?: string;

  /**
   * Page number for pagination
   * @example 1
   */
  @ValidateIf(
    (dto: MovieQueryDto) => dto.page !== undefined && dto.page !== null
  )
  @IsInt({ message: BadRequestExceptionMessages.PROVIDE_NUMBER })
  @IsPositive()
  @Type(() => Number)
  page?: number = 1;

  /**
   * Number of items per page
   * @example 10
   */
  @ValidateIf(
    (dto: MovieQueryDto) => dto.limit !== undefined && dto.limit !== null
  )
  @IsInt({ message: BadRequestExceptionMessages.PROVIDE_NUMBER })
  @IsPositive()
  @Type(() => Number)
  limit?: number = 10;

  /**
   * Field to sort results by
   * @example "releaseDate"
   */
  @ValidateIf(
    (dto: MovieQueryDto) => dto.sortBy !== undefined && dto.sortBy !== null
  )
  @IsEnum(
    [
      "title",
      "releaseDate",
      "rating",
      "genre",
      "director",
      "imdbId",
      "createdAt",
      "updatedAt",
      "id",
    ],
    { message: "Provide valid sort key" }
  )
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  sortBy?: keyof Movie;

  /**
   * Sort direction (ascending or descending)
   * @example "desc"
   */
  @ValidateIf(
    (dto: MovieQueryDto) => dto.sortDir !== undefined && dto.sortDir !== null
  )
  @IsEnum(["desc", "asc"], { message: "Provide valid sort direction" })
  sortDir?: "desc" | "asc" = "asc";
}
