import { Movie } from "../../../domain/entities";
import {
  CreateMovieDto,
  UpdateMovieDto,
} from "../../../interfaces/dtos/request/movie";
import { MovieDto } from "../../../interfaces/dtos/response/movie";
import { DirectorMapper } from "./DirectorMapper";

export class MovieMapper {
  /**
   * Maps a domain entity to a response DTO
   */
  static toMovieDto(movie: Movie): MovieDto {
    const dto = new MovieDto();
    dto.id = movie.id!;
    dto.title = movie.title;
    dto.description = movie.description;
    dto.releaseDate = movie.releaseDate;
    dto.genre = movie.genre;
    dto.rating = movie.rating;
    dto.imdbId = movie.imdbId;

    // Handle director mapping
    dto.director = DirectorMapper.toDirectorDto(movie.director);

    dto.createdAt = movie.createdAt;
    dto.updatedAt = movie.updatedAt;

    return dto;
  }

  /**
   * Maps a create DTO to domain entity
   */
  static fromCreateDto(
    dto: CreateMovieDto
  ): Omit<Movie, "id" | "createdAt" | "updatedAt"> {
    return {
      title: dto.title,
      description: dto.description,
      releaseDate: dto.releaseDate,
      genre: dto.genre,
      rating: dto.rating,
      imdbId: dto.imdbId,
      director: dto.director,
    };
  }

  /**
   * Maps an update DTO to domain entity partial
   */
  static fromUpdateDto(dto: UpdateMovieDto): Partial<Movie> {
    const movie: Partial<Movie> = {};

    if (dto.title !== undefined) movie.title = dto.title;
    if (dto.description !== undefined) movie.description = dto.description;
    if (dto.releaseDate !== undefined) movie.releaseDate = dto.releaseDate;
    if (dto.genre !== undefined) movie.genre = dto.genre;
    if (dto.rating !== undefined) movie.rating = dto.rating;
    if (dto.imdbId !== undefined) movie.imdbId = dto.imdbId;
    if (dto.director !== undefined) movie.director = dto.director;

    return movie;
  }
}
