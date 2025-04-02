import { inject, injectable, singleton } from "tsyringe";
import { Movie } from "../../../domain/entities/Movie";
import { MovieRepository } from "../../../domain/repositories/MovieRepository";
import { LOGGER, Logger } from "../../../infrastructure/logger/Logger";
import { UpdateMovieResponseDto } from "../../../interfaces/dtos/response/movie";
import { MovieMapper } from "../../../interfaces/mappers";
import { MovieApplicationService } from "../../services";

@injectable()
@singleton()
export class UpdateMovieUseCase {
  constructor(
    @inject(LOGGER) private readonly logger: Logger,
    @inject("MovieRepository")
    private readonly movieRepository: MovieRepository,
    @inject(MovieApplicationService.name)
    private readonly movieApplicationService: MovieApplicationService
  ) {
    this.logger.setOrganizationAndContext(UpdateMovieUseCase.name);
  }

  /**
   * Updates an existing movie with new data
   *
   * @param id The unique identifier of the movie to update
   * @param movieData Partial movie object containing the fields to update
   * @returns The updated movie DTO if found, null otherwise
   * @throws Error if update fails for reasons other than not found
   */
  async execute(
    id: string,
    movieData: Partial<Movie>
  ): Promise<UpdateMovieResponseDto | null> {
    this.logger.info("Updating movie", { props: { id, movieData } });

    try {
      if (movieData.director) {
        const isDirectorExists =
          await this.movieApplicationService.directorExists(
            movieData.director.toString()
          );

        if (!isDirectorExists) {
          this.logger.debug("Director not found");
          return null;
        }
      }

      // Update movie in repository
      const updatedMovie = await this.movieRepository.update(id, movieData);

      // Return null if not found
      if (!updatedMovie) {
        return null;
      }

      // Map to DTO before returning
      return MovieMapper.toCreateMovieResponseDto(
        MovieMapper.toMovieDto(updatedMovie)
      );
    } catch (error: any) {
      this.logger.error("Failed to update movie", { error, props: { id } });
      throw error;
    }
  }
}
