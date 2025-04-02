import { Request, Response } from "express";
import { inject, injectable, singleton } from "tsyringe";
import {
  CreateDirectorUseCase,
  DeleteDirectorUseCase,
} from "../../../application/use-cases/director";
import { LOGGER, Logger } from "../../../infrastructure/logger/Logger";
import { NotFoundExceptionMessages } from "../../constants/exception-messages";
import { CreateDirectorDto } from "../../dtos/request/director";
import { DirectorMapper } from "../../mappers";
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
   * @swagger
   * /api/v1/directors:
   *   post:
   *     summary: Create a new director
   *     description: Creates a new director in the database
   *     tags:
   *      - Directors
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateDirectorDto'
   *     responses:
   *       201:
   *         description: Director created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CreateDirectorResponseDto'
   */
  async createDirector(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Creating director", {
        props: { directorData: req.body },
      });

      console.log(req.query);
      console.log(req.body);
      console.log(req.params);

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
   * @swagger
   * /api/v1/directors/{id}:
   *   delete:
   *     summary: Delete a director
   *     description: Deletes a director from the database
   *     tags:
   *      - Directors
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: The ID of the director to delete
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Director deleted successfully
   *       404:
   *         description: Director not found
   *       500:
   *         description: Internal server error
   */
  async deleteDirector(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      this.logger.info("Deleting director", { props: { id } });

      const result = await this.deleteDirectorUseCase.execute(id);

      if (!result) {
        HttpResponse.notFound(
          res,
          NotFoundExceptionMessages.DIRECTOR_NOT_FOUND
        );
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
