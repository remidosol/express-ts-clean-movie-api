import { Movie } from "../../domain/entities";
import { CreateMovieDto, UpdateMovieDto } from "../dtos/request/movie";
import {
  CreateMovieResponseDto,
  GetMovieResponseDto,
  MovieDto,
  MovieListResponseDto,
  UpdateMovieResponseDto,
} from "../dtos/response/movie";
import { PaginationDto } from "../dtos/response/PaginationDto";
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

  /**
   * Maps a MovieDto to a create response DTO
   */
  static toCreateMovieResponseDto(movieDto: MovieDto): CreateMovieResponseDto {
    const responseDto = new CreateMovieResponseDto();
    responseDto.data = movieDto;
    return responseDto;
  }

  /**
   * Maps a MovieDto to an update response DTO
   */
  static toUpdateMovieResponseDto(movieDto: MovieDto): UpdateMovieResponseDto {
    const responseDto = new UpdateMovieResponseDto();
    responseDto.data = movieDto;
    return responseDto;
  }

  /**
   * Maps a MovieDto to a get response DTO
   */
  static toGetMovieResponseDto(movieDto: MovieDto): GetMovieResponseDto {
    const responseDto = new GetMovieResponseDto();
    responseDto.data = movieDto;
    return responseDto;
  }

  /**
   * Maps an array of MovieDto and pagination info to a list response DTO
   */
  static toMovieListResponseDto(
    movieDtos: MovieDto[],
    pagination: PaginationDto
  ): MovieListResponseDto {
    const responseDto = new MovieListResponseDto();
    responseDto.data = movieDtos;
    responseDto.pagination = pagination;
    return responseDto;
  }
}
