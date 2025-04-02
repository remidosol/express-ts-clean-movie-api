import { inject, injectable, singleton } from "tsyringe";
import { Director } from "../../../domain/entities/Director";
import { DirectorRepository } from "../../../domain/repositories/DirectorRepository";
import { LOGGER, Logger } from "../../../infrastructure/logger/Logger";
import { CreateDirectorResponseDto } from "../../../interfaces/dtos/response/director";
import { DirectorMapper } from "../../../interfaces/mappers";

@injectable()
@singleton()
export class CreateDirectorUseCase {
  constructor(
    @inject(LOGGER) private readonly logger: Logger,
    @inject("DirectorRepository")
    private readonly directorRepository: DirectorRepository
  ) {
    this.logger.setOrganizationAndContext(CreateDirectorUseCase.name);
  }

  /**
   * Creates a new director in the database
   *
   * @param directorData The director data to create (without id, createdAt, updatedAt)
   * @returns The created director as a DTO
   * @throws Error if director creation fails (e.g., validation error or database error)
   */
  async execute(
    directorData: Omit<Director, "id" | "createdAt" | "updatedAt">
  ): Promise<CreateDirectorResponseDto> {
    this.logger.info("Creating new director", { props: { directorData } });

    try {
      // Create the director in the repository
      const createdDirector =
        await this.directorRepository.create(directorData);

      // Map to DTO before returning
      return DirectorMapper.toCreateDirectorResponseDto(
        DirectorMapper.toDirectorDto(createdDirector)
      );
    } catch (error: any) {
      this.logger.error("Failed to create director", { error });
      throw error;
    }
  }
}
