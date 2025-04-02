import { Expose, Type } from "class-transformer";
import { MovieDto } from "./MovieDto";

/**
 * Data transfer object for single movie retrieval response
 */
export class GetMovieResponseDto {
  /**
   * Retrieved movie data
   * @example {"id":"507f1f77bcf86cd799439011","title":"The Dark Knight","description":"Batman fights the menace known as the Joker.","genre":"Action","rating":9.0}
   */
  @Expose()
  @Type(() => MovieDto)
  data!: MovieDto;
}
