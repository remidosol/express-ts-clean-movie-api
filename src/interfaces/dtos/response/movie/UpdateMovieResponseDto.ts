import { Expose, Type } from "class-transformer";
import { MovieDto } from "./MovieDto";

/**
 * Data transfer object for movie update response
 */
export class UpdateMovieResponseDto {
  /**
   * Updated movie data
   * @example {"id":"507f1f77bcf86cd799439011","title":"Inception","description":"A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.","genre":"Sci-Fi","rating":8.8}
   */
  @Expose()
  @Type(() => MovieDto)
  data!: MovieDto;
}
