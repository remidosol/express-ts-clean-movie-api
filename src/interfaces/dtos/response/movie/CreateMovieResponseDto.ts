import { Expose, Type } from "class-transformer";
import { MovieDto } from "./MovieDto";

/**
 * Data transfer object for movie creation response
 */
export class CreateMovieResponseDto {
  /**
   * Created movie data
   * @example {"id":"507f1f77bcf86cd799439011","title":"Interstellar","description":"A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.","genre":"Sci-Fi","rating":8.6}
   */
  @Expose()
  @Type(() => MovieDto)
  data!: MovieDto;
}
