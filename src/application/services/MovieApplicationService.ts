import { inject, injectable, singleton } from "tsyringe";
import { DirectorRepository } from "../../domain/repositories";
import { LOGGER, Logger } from "../../infrastructure/logger/Logger";

@injectable()
@singleton()
export class MovieApplicationService {
  constructor(
    @inject(LOGGER) private readonly logger: Logger,
    @inject("DirectorRepository")
    private readonly directorRepository: DirectorRepository
  ) {
    logger.setOrganizationAndContext(MovieApplicationService.name);
  }

  /**
   * Checks if a director exists by ID
   * @param directorId The ID of the director to check
   * @returns Result with boolean indicating if director exists
   */
  async directorExists(directorId: string): Promise<boolean> {
    try {
      const director = await this.directorRepository.findById(directorId);

      return !!director;
    } catch (error: any) {
      this.logger.error("Failed to check director existence", { error });
      throw new Error(`Error checking director existence: ${error.message}`);
    }
  }
}
