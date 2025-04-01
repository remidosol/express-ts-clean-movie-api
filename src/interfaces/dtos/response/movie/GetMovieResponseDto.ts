import { Expose, Type } from "class-transformer";
import { MovieDto } from "./MovieDto";

/**
 * Data transfer object for single movie retrieval response
 */
export class GetMovieResponseDto {
  @Expose()
  @Type(() => MovieDto)
  data!: MovieDto;
}
