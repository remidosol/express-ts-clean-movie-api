import { inject, injectable, singleton } from "tsyringe";
import { Movie } from "../../../domain/entities/Movie";
import { MovieRepository } from "../../../domain/repositories/MovieRepository";
import { LOGGER, Logger } from "../../../infrastructure/logger/Logger";
import { MovieListResponseDto } from "../../../interfaces/dtos/response/movie";
import { MovieMapper } from "../../../interfaces/mappers";

export interface GetAllMoviesOptions {
  page?: number;
  limit?: number;
  sortBy?: keyof Movie;
  sortDir?: "asc" | "desc";
  filters?: Partial<Movie>;
}

@injectable()
@singleton()
export class GetAllMoviesUseCase {
  constructor(
    @inject(LOGGER) private readonly logger: Logger,
    @inject("MovieRepository") private readonly movieRepository: MovieRepository
  ) {
    this.logger.setOrganizationAndContext(GetAllMoviesUseCase.name);
  }

  /**
   * Retrieves all movies with filtering, pagination, and sorting options
   *
   * @param options Configuration object containing:
   *  - page: The page number to retrieve (default: 1)
   *  - limit: The number of items per page (default: 10)
   *  - sortBy: Field to sort by
   *  - sortDir: Sort direction ('asc' or 'desc')
   *  - filters: Object with filter criteria
   * @returns Object with paginated movie data and pagination metadata
   * @throws Error if retrieval fails
   */
  async execute(
    options: GetAllMoviesOptions = {}
  ): Promise<MovieListResponseDto> {
    const {
      filters = {},
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortDir = "desc",
    } = options;

    const sort = sortDir === "desc" ? { [sortBy]: -1 } : { [sortBy]: 1 };

    this.logger.info("Getting all movies", { props: { options } });

    try {
      // Return paginated result
      const movies = await this.movieRepository.findAll({
        filters,
        pagination: {
          page,
          limit,
        },
        sort,
        populate: [{ path: "director", select: "id firstName secondName" }],
      });

      // Map to DTOs
      const movieDTOs = movies.map((movie) => MovieMapper.toMovieDto(movie));
      const movieCount = await this.movieRepository.getCount(filters);

      return {
        data: movieDTOs,
        pagination: {
          total: movieCount,
          page,
          limit,
          pages: Math.ceil(movieCount / limit),
        },
      };
    } catch (error: any) {
      this.logger.error("Failed to get movies", { error });
      throw error;
    }
  }
}
