import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Movie } from "../../../../domain/entities";
import { BadRequestExceptionMessages } from "../../../constants/exception-messages";

enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export class MovieQueryDto {
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsOptional()
  title?: string;

  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsOptional()
  genre?: string;

  @IsNumber({}, { message: BadRequestExceptionMessages.PROVIDE_NUMBER })
  @Min(0)
  @Max(10)
  @IsOptional()
  rating?: number;

  @IsDate({ message: BadRequestExceptionMessages.PROVIDE_VALID_DATE })
  @Type(() => Date)
  @IsOptional()
  releaseDate?: Date;

  @IsMongoId({ message: BadRequestExceptionMessages.INVALID_ID })
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsOptional()
  director?: string;

  // Pagination fields
  @IsInt({ message: BadRequestExceptionMessages.PROVIDE_NUMBER })
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt({ message: BadRequestExceptionMessages.PROVIDE_NUMBER })
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  // Sorting fields
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsOptional()
  sortBy?: keyof Movie;

  @IsEnum(SortDirection, { message: "Provide valid sort direction" })
  @IsOptional()
  sortDir?: SortDirection = SortDirection.ASC;
}
