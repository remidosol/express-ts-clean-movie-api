import { Expose, Type } from "class-transformer";
import { DirectorDto } from "../director";

/**
 * Data transfer object for movie information in API responses
 */
export class MovieDto {
  /**
   * Unique identifier of the movie
   * @example "507f1f77bcf86cd799439011"
   */
  @Expose()
  id!: string;

  /**
   * Title of the movie
   * @example "The Shawshank Redemption"
   */
  @Expose()
  title!: string;

  /**
   * Description of the movie plot
   * @example "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
   */
  @Expose()
  description!: string;

  /**
   * Release date of the movie
   * @example "1994-09-23T00:00:00.000Z"
   */
  @Expose()
  releaseDate!: Date;

  /**
   * Genre of the movie
   * @example "Drama"
   */
  @Expose()
  genre!: string;

  /**
   * Rating of the movie (0-10)
   * @example 9.3
   */
  @Expose()
  rating?: number;

  /**
   * IMDB identifier of the movie
   * @example "tt0111161"
   */
  @Expose()
  imdbId!: string;

  /**
   * Director of the movie
   * @example {"id":"507f1f77bcf86cd799439012","firstName":"Frank","secondName":"Darabont"}
   */
  @Expose()
  @Type(() => DirectorDto)
  director!: DirectorDto;

  /**
   * Creation timestamp
   * @example "2023-01-15T08:30:00.000Z"
   */
  @Expose()
  createdAt!: Date;

  /**
   * Last update timestamp
   * @example "2023-01-15T09:15:00.000Z"
   */
  @Expose()
  updatedAt!: Date;
}
