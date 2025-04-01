import { inject, injectable, singleton } from "tsyringe";
import { DirectorRepository } from "../../../domain/repositories/DirectorRepository";
import { LOGGER, Logger } from "../../../infrastructure/logger/Logger";

@injectable()
@singleton()
export class DeleteDirectorUseCase {
  constructor(
    @inject(LOGGER) private readonly logger: Logger,
    @inject("DirectorRepository")
    private readonly directorRepository: DirectorRepository
  ) {
    this.logger.setOrganizationAndContext(DeleteDirectorUseCase.name);
  }

  /**
   * Deletes a director from the database by its ID
   *
   * @param id The unique identifier of the director to delete
   * @returns A boolean indicating if the director was successfully deleted
   * @throws Error if the delete operation fails
   */
  async execute(id: string): Promise<boolean> {
    this.logger.info("Deleting director", { props: { id } });

    try {
      // Delete director from repository
      const success = await this.directorRepository.delete(id);
      return success;
    } catch (error: any) {
      this.logger.error("Failed to delete director", { error, props: { id } });
      throw error;
    }
  }
}
