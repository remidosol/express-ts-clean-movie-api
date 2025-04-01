import { inject, injectable, singleton } from "tsyringe";
import { MovieRepository } from "../../../domain/repositories/MovieRepository";
import { LOGGER, Logger } from "../../../infrastructure/logger/Logger";

@injectable()
@singleton()
export class DeleteMovieUseCase {
  constructor(
    @inject(LOGGER) private readonly logger: Logger,
    @inject("MovieRepository") private readonly movieRepository: MovieRepository
  ) {
    this.logger.setOrganizationAndContext(DeleteMovieUseCase.name);
  }

  /**
   * Deletes a movie from the database by its ID
   *
   * @param id The unique identifier of the movie to delete
   * @returns A boolean indicating if the movie was successfully deleted
   * @throws Error if the delete operation fails
   */
  async execute(id: string): Promise<boolean> {
    this.logger.info("Deleting movie", { props: { id } });

    try {
      // Delete movie from repository
      const success = await this.movieRepository.delete(id);
      return success;
    } catch (error: any) {
      this.logger.error("Failed to delete movie", { error, props: { id } });
      throw error;
    }
  }
}
