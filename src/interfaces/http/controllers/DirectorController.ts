import { Request, Response } from "express";
import { inject, injectable, singleton } from "tsyringe";
import { DirectorMapper } from "../../../application/services/mappers";
import {
  CreateDirectorUseCase,
  DeleteDirectorUseCase,
} from "../../../application/use-cases/director";
import { LOGGER, Logger } from "../../../infrastructure/logger/Logger";
import { NotFoundExceptionMessages } from "../../constants/exception-messages";
import { CreateDirectorDto } from "../../dtos/request/director";
import { HttpResponse } from "../response";

@injectable()
@singleton()
export class DirectorController {
  constructor(
    @inject(LOGGER) private readonly logger: Logger,
    @inject(CreateDirectorUseCase.name)
    private createDirectorUseCase: CreateDirectorUseCase,
    @inject(DeleteDirectorUseCase.name)
    private deleteDirectorUseCase: DeleteDirectorUseCase
  ) {
    logger.setOrganizationAndContext(DirectorController.name);
  }

  /**
   * Creates a new director in the database
   *
   * @param req Express request containing the director data in the body
   * @param res Express response object
   * @returns Promise<void>
   *
   * @throws Will delegate errors to the HttpResponse handler
   * @response 201 Returns the created director
   * @response 400 If validation fails
   * @response 500 If a server error occurs
   */
  async createDirector(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Creating director", {
        props: { directorData: req.body },
      });

      const createDirectorDto = req.body as CreateDirectorDto;

      const directorParams = DirectorMapper.fromCreateDto(createDirectorDto);

      const result = await this.createDirectorUseCase.execute(directorParams);

      HttpResponse.created(res, result);
    } catch (error: any) {
      this.logger.error("Error creating director", { error });
      HttpResponse.handleError(res, error);
    }
  }

  /**
   * Deletes a director from the database
   *
   * @param req Express request containing the director ID in the route parameters
   * @param res Express response object
   * @returns Promise<void>
   *
   * @throws Will delegate errors to the HttpResponse handler
   * @response 204 If the director was successfully deleted (no content)
   * @response 404 If the director is not found
   * @response 500 If a server error occurs
   */
  async deleteDirector(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      this.logger.info("Deleting director", { props: { id } });

      const result = await this.deleteDirectorUseCase.execute(id);

      if (!result) {
        HttpResponse.notFound(res, NotFoundExceptionMessages.MOVIE_NOT_FOUND);
        return;
      }

      HttpResponse.noContent(res);
    } catch (error: any) {
      this.logger.error("Error deleting director", {
        error,
        props: { id: req.params.id },
      });
      HttpResponse.handleError(res, error);
    }
  }
}
