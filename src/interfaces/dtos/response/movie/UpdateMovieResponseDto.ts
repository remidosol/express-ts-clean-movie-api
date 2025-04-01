import { Expose, Type } from "class-transformer";
import { MovieDto } from "./MovieDto";

/**
 * Data transfer object for movie update response
 */
export class UpdateMovieResponseDto {
  @Expose()
  @Type(() => MovieDto)
  data!: MovieDto;
}
