import { Expose, Type } from "class-transformer";
import { PaginationDto } from "../PaginationDto";
import { MovieDto } from "./MovieDto";

/**
 * Data transfer object for paginated movie list responses
 */
export class MovieListResponseDto {
  /**
   * List of movies
   * @example [{"id":"507f1f77bcf86cd799439011","title":"The Godfather","description":"The aging patriarch of an organized crime dynasty transfers control to his son.","genre":"Crime","rating":9.2}]
   */
  @Expose()
  @Type(() => MovieDto)
  data!: MovieDto[];

  /**
   * Pagination information
   * @example {"total":100,"page":1,"limit":10,"pages":10}
   */
  @Expose()
  @Type(() => PaginationDto)
  pagination!: PaginationDto;
}
