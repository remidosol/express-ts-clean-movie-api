import { HydratedDocument, Model } from "mongoose";
import { inject, injectable, singleton } from "tsyringe";
import { Director } from "../../domain/entities";
import { DirectorRepository } from "../../domain/repositories";
import { LOGGER, Logger } from "../logger/Logger";
import { MongoDirectorMapper } from "../mappers";

/**
 * MongoDirectorRepository is a concrete implementation of the DirectorRepository interface
 * that interacts with a MongoDB database using Mongoose.
 */
@injectable()
@singleton()
export class MongoDirectorRepository implements DirectorRepository {
  constructor(
    @inject(LOGGER) private readonly logger: Logger,
    @inject("DirectorModel")
    private readonly directorModel: Model<HydratedDocument<Director>>
  ) {
    logger.setOrganizationAndContext(MongoDirectorRepository.name);
  }

  /**
   * Finds a director by their unique identifier
   * @param id - The unique identifier of the director
   * @returns A Promise that resolves to a Director entity or null if not found
   */
  async findById(id: string): Promise<Director | null> {
    try {
      const director = await this.directorModel.findById(id).exec();

      if (!director) return null;

      return MongoDirectorMapper.toEntity(director);
    } catch (error: any) {
      this.logger.error("Error in findById:", { error });
      return null;
    }
  }

  /**
   * Creates a new director in the database
   * @param director - The partial director entity to be created
   * @returns A Promise that resolves to the newly created Director entity
   * @throws Will throw an error if the creation fails
   */
  async create(director: Partial<Director>): Promise<Director> {
    try {
      const directorDocument = MongoDirectorMapper.toDocument(director);

      const newDirector = new this.directorModel(directorDocument);
      const savedDirector = await newDirector.save();

      return MongoDirectorMapper.toEntity(savedDirector);
    } catch (error: any) {
      this.logger.error("Error in create:", error);
      throw error;
    }
  }

  /**
   * Deletes a director from the database
   * @param id - The unique identifier of the director to delete
   * @returns A Promise that resolves to a boolean indicating success (true) or failure (false)
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.directorModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error: any) {
      this.logger.error("Error in delete:", error);
      return false;
    }
  }
}
