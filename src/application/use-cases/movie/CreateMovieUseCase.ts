import { inject, injectable, singleton } from "tsyringe";
import { Movie } from "../../../domain/entities/Movie";
import { MovieRepository } from "../../../domain/repositories/MovieRepository";
import { LOGGER, Logger } from "../../../infrastructure/logger/Logger";
import { MovieDto } from "../../../interfaces/dtos/response/movie";
import { MovieMapper } from "../../services/mappers";

@injectable()
@singleton()
export class CreateMovieUseCase {
  constructor(
    @inject(LOGGER) private readonly logger: Logger,
    @inject("MovieRepository") private readonly movieRepository: MovieRepository
  ) {
    this.logger.setOrganizationAndContext(CreateMovieUseCase.name);
  }

  /**
   * Creates a new movie in the database
   *
   * @param movieData The movie data to create (without id, createdAt, updatedAt)
   * @returns The created movie as a DTO
   * @throws Error if movie creation fails (e.g., validation error or database error)
   */
  async execute(
    movieData: Omit<Movie, "id" | "createdAt" | "updatedAt">
  ): Promise<MovieDto> {
    this.logger.info("Creating new movie", { props: { movieData } });

    try {
      // Create the movie in the repository
      const createdMovie = await this.movieRepository.create(movieData);

      // Map to DTO before returning
      return MovieMapper.toMovieDto(createdMovie);
    } catch (error: any) {
      this.logger.error("Failed to create movie", { error });
      throw error;
    }
  }
}
