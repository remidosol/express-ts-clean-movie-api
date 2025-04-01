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

export class UpdateMovieDto {
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_TITLE })
  @IsOptional()
  title?: string;

  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_DESCRIPTION })
  @IsOptional()
  description?: string;

  @IsDate({ message: MovieValidationMessages.INVALID_RELEASE_DATE })
  @Type(() => Date)
  @IsOptional()
  releaseDate?: Date;

  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_GENRE })
  @IsOptional()
  genre?: string;

  @IsNumber({}, { message: BadRequestExceptionMessages.PROVIDE_NUMBER })
  @Min(0)
  @Max(10)
  @IsOptional()
  rating?: number;

  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_IMDB_ID })
  @IsOptional()
  imdbId?: string;

  @IsMongoId({ message: BadRequestExceptionMessages.INVALID_ID })
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsOptional()
  director?: string;
}
