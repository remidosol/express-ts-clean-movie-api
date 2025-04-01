import { Expose, Type } from "class-transformer";
import { DirectorDto } from "../director";

/**
 * Data transfer object for movie information in API responses
 */
export class MovieDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  description!: string;

  @Expose()
  releaseDate!: Date;

  @Expose()
  genre!: string;

  @Expose()
  rating?: number;

  @Expose()
  imdbId!: string;

  @Expose()
  @Type(() => DirectorDto)
  director!: DirectorDto;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
