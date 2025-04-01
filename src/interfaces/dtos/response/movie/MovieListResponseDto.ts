import { Expose, Type } from "class-transformer";
import { PaginationDto } from "../PaginationDto";
import { MovieDto } from "./MovieDto";

/**
 * Data transfer object for paginated movie list responses
 */
export class MovieListResponseDto {
  @Expose()
  @Type(() => MovieDto)
  data!: MovieDto[];

  @Expose()
  @Type(() => PaginationDto)
  pagination!: PaginationDto;
}
