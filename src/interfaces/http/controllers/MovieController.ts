import { Request, Response } from "express";
import { inject, injectable, singleton } from "tsyringe";
import {
  CreateMovieUseCase,
  DeleteMovieUseCase,
  GetAllMoviesOptions,
  GetAllMoviesUseCase,
  GetMovieByIdUseCase,
  UpdateMovieUseCase,
} from "../../../application/use-cases/movie";
import { Movie } from "../../../domain/entities";
import { LOGGER, Logger } from "../../../infrastructure/logger/Logger";
import { NotFoundExceptionMessages } from "../../constants/exception-messages";
import {
  CreateMovieDto,
  MovieQueryDto,
  UpdateMovieDto,
} from "../../dtos/request/movie";
import { MovieMapper } from "../../mappers";
import { HttpResponse } from "../response";

@injectable()
@singleton()
export class MovieController {
  constructor(
    @inject(LOGGER) private readonly logger: Logger,
    @inject(CreateMovieUseCase.name)
    private createMovieUseCase: CreateMovieUseCase,
    @inject(GetAllMoviesUseCase.name)
    private getAllMoviesUseCase: GetAllMoviesUseCase,
    @inject(GetMovieByIdUseCase.name)
    private getMovieByIdUseCase: GetMovieByIdUseCase,
    @inject(UpdateMovieUseCase.name)
    private updateMovieUseCase: UpdateMovieUseCase,
    @inject(DeleteMovieUseCase.name)
    private deleteMovieUseCase: DeleteMovieUseCase
  ) {
    logger.setOrganizationAndContext(MovieController.name);
  }

  /**
   * @swagger
   * /api/v1/movies:
   *   post:
   *     summary: Create a new movie
   *     description: Creates a new movie in the database
   *     tags:
   *      - Movies
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateMovieDto'
   *     responses:
   *       201:
   *         description: Movie created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CreateMovieResponseDto'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Validation error"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Internal server error"
   */
  async createMovie(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Creating movie", { props: { movieData: req.body } });

      const createMovieDto = req.body as CreateMovieDto;

      const movieParams = MovieMapper.fromCreateDto(createMovieDto);

      const result = await this.createMovieUseCase.execute(movieParams);

      if (!result) {
        HttpResponse.badRequest(res, "Director not found");
        return;
      }

      HttpResponse.created(res, result);
    } catch (error: any) {
      this.logger.error("Error creating movie", { error });
      HttpResponse.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/v1/movies:
   *   get:
   *     summary: Get all movies
   *     description: Retrieves a list of movies with optional filtering, pagination and sorting
   *     tags:
   *      - Movies
   *     parameters:
   *       - name: page
   *         in: query
   *         required: false
   *         description: "The page number to retrieve (default: 1)"
   *         schema:
   *           type: integer
   *           example: 1
   *       - name: limit
   *         in: query
   *         required: false
   *         description: "The number of items per page (default: 10)"
   *         schema:
   *           type: integer
   *           example: 10
   *       - name: sortBy
   *         in: query
   *         required: false
   *         description: Field to sort by
   *         schema:
   *           type: string
   *           enum: [title, releaseDate, rating, genre, director, imdbId, createdAt, updatedAt, id]
   *           example: "title"
   *       - name: sortDir
   *         in: query
   *         required: false
   *         description: Sort direction ('asc' or 'desc')
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           example: "asc"
   *       - name: filters
   *         in: query
   *         required: false
   *         description: Object with filter criteria
   *         schema:
   *           type: object
   *           additionalProperties:
   *             type: string
   *           example: { "genre": "Action", "rating": 10 }
   *     responses:
   *       200:
   *         description: Paginated list of movies
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MovieListResponseDto'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Internal server error"
   */
  async getAllMovies(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Getting all movies", { props: { query: req.query } });

      const {
        page = 1,
        limit = 10,
        sortBy,
        sortDir,
        ...filters
      } = req.query as MovieQueryDto;

      const options: GetAllMoviesOptions = {
        page,
        limit,
        sortBy,
        sortDir,
        filters,
      };

      const result = await this.getAllMoviesUseCase.execute(options);

      HttpResponse.ok(res, result);
    } catch (error: any) {
      this.logger.error("Error getting all movies", { error });
      HttpResponse.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/v1/movies/{id}:
   *   get:
   *     summary: Get a movie by ID
   *     description: Retrieves a movie by its unique identifier
   *     tags:
   *      - Movies
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: The ID of the movie to retrieve
   *         schema:
   *           type: string
   *           example: "60d5ec49f1b2c8f1a4e4b8c3"
   *     responses:
   *       200:
   *         description: Movie found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GetMovieResponseDto'
   *       404:
   *         description: Movie not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Movie not found"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Internal server error"
   */
  async getMovieById(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Getting movie by id", { props: { id: req.params.id } });

      const { id } = req.params;

      const result = await this.getMovieByIdUseCase.execute(id);

      if (!result) {
        HttpResponse.notFound(res, NotFoundExceptionMessages.MOVIE_NOT_FOUND);
        return;
      }

      HttpResponse.ok(res, result);
    } catch (error: any) {
      this.logger.error("Error getting movie by id", {
        error,
        props: { id: req.params.id },
      });
      HttpResponse.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/v1/movies/{id}:
   *   patch:
   *     summary: Update a movie
   *     description: Updates an existing movie in the database
   *     tags:
   *      - Movies
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: The ID of the movie to update
   *         schema:
   *           type: string
   *           example: "60d5ec49f1b2c8f1a4e4b8c3"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateMovieDto'
   *     responses:
   *       200:
   *         description: Movie updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UpdateMovieResponseDto'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Validation error"
   *       404:
   *         description: Movie not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Movie not found"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Internal server error"
   */
  async updateMovie(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const updateMovieDto = req.body as UpdateMovieDto;

      const movieData: Partial<Movie> = {
        title: updateMovieDto.title,
        description: updateMovieDto.description,
        releaseDate: updateMovieDto.releaseDate,
        genre: updateMovieDto.genre,
        director: updateMovieDto.director,
        imdbId: updateMovieDto.imdbId,
        rating: updateMovieDto.rating,
      };

      this.logger.info("Updating movie", { props: { id, movieData } });

      const result = await this.updateMovieUseCase.execute(id, movieData);

      if (!result) {
        HttpResponse.notFound(
          res,
          NotFoundExceptionMessages.MOVIE_OR_DIRECTOR_NOT_FOUND
        );
        return;
      }

      HttpResponse.ok(res, result);
    } catch (error: any) {
      this.logger.error("Error updating movie", {
        error,
        props: { id: req.params.id },
      });
      HttpResponse.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/v1/movies/{id}:
   *   delete:
   *     summary: Delete a movie
   *     description: Deletes a movie from the database
   *     tags:
   *      - Movies
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: The ID of the movie to delete
   *         schema:
   *           type: string
   *           example: "60d5ec49f1b2c8f1a4e4b8c3"
   *     responses:
   *       204:
   *         description: Movie deleted successfully
   *       404:
   *         description: Movie not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Movie not found"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Internal server error"
   */
  async deleteMovie(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      this.logger.info("Deleting movie", { props: { id } });

      const result = await this.deleteMovieUseCase.execute(id);

      if (!result) {
        HttpResponse.notFound(res, NotFoundExceptionMessages.MOVIE_NOT_FOUND);
        return;
      }

      HttpResponse.noContent(res);
    } catch (error: any) {
      this.logger.error("Error deleting movie", {
        error,
        props: { id: req.params.id },
      });
      HttpResponse.handleError(res, error);
    }
  }
}
