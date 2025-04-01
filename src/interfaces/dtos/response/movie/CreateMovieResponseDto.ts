import { Expose, Type } from "class-transformer";
import { MovieDto } from "./MovieDto";

/**
 * Data transfer object for movie creation response
 */
export class CreateMovieResponseDto {
  @Expose()
  @Type(() => MovieDto)
  data!: MovieDto;
}
