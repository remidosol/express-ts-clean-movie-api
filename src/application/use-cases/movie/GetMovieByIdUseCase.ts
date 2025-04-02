import { inject, injectable, singleton } from "tsyringe";
import { MovieRepository } from "../../../domain/repositories/MovieRepository";
import { LOGGER, Logger } from "../../../infrastructure/logger/Logger";
import { GetMovieResponseDto } from "../../../interfaces/dtos/response/movie";
import { MovieMapper } from "../../../interfaces/mappers";

@injectable()
@singleton()
export class GetMovieByIdUseCase {
  constructor(
    @inject(LOGGER) private readonly logger: Logger,
    @inject("MovieRepository") private readonly movieRepository: MovieRepository
  ) {
    this.logger.setOrganizationAndContext(GetMovieByIdUseCase.name);
  }

  /**
   * Retrieves a movie by its unique identifier
   *
   * @param id The unique identifier of the movie to retrieve
   * @returns The movie DTO if found, null otherwise
   * @throws Error if retrieval fails for reasons other than not found
   */
  async execute(id: string): Promise<GetMovieResponseDto | null> {
    this.logger.info("Getting movie by id", { props: { id } });

    try {
      // Get movie from repository
      const movie = await this.movieRepository.findById(id);

      // Return null if not found
      if (!movie) {
        return null;
      }

      return MovieMapper.toCreateMovieResponseDto(
        MovieMapper.toMovieDto(movie)
      );
    } catch (error: any) {
      this.logger.error("Failed to get movie by id", { error, props: { id } });
      throw error;
    }
  }
}
