import { Request, Response } from "express";
import { inject, injectable, singleton } from "tsyringe";
import { MovieMapper } from "../../../application/services/mappers";
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
   * Creates a new movie in the database
   *
   * @param req Express request containing the movie data in the body
   * @param res Express response object
   * @returns Promise<void>
   *
   * @throws Will delegate errors to the HttpResponse handler
   * @response 201 Returns the created movie
   * @response 400 If validation fails
   * @response 500 If a server error occurs
   */
  async createMovie(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info("Creating movie", { props: { movieData: req.body } });

      const createMovieDto = req.body as CreateMovieDto;

      const movieParams = MovieMapper.fromCreateDto(createMovieDto);

      const result = await this.createMovieUseCase.execute(movieParams);

      HttpResponse.created(res, result);
    } catch (error: any) {
      this.logger.error("Error creating movie", { error });
      HttpResponse.handleError(res, error);
    }
  }

  /**
   * Retrieves a list of movies with optional filtering, pagination and sorting
   *
   * @param req Express request containing query parameters
   * @param res Express response object
   * @returns Promise<void>
   *
   * @throws Will delegate errors to the HttpResponse handler
   * @response 200 Returns paginated list of movies
   * @response 500 If a server error occurs
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
        page: Number(page),
        limit: Number(limit),
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
   * Retrieves a movie by its unique identifier
   *
   * @param req Express request containing the movie ID in the route parameters
   * @param res Express response object
   * @returns Promise<void>
   *
   * @throws Will delegate errors to the HttpResponse handler
   * @response 200 Returns the movie if found
   * @response 404 If the movie is not found
   * @response 500 If a server error occurs
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
   * Updates an existing movie
   *
   * @param req Express request containing the movie ID in the route parameters and update data in the body
   * @param res Express response object
   * @returns Promise<void>
   *
   * @throws Will delegate errors to the HttpResponse handler
   * @response 200 Returns the updated movie
   * @response 404 If the movie is not found
   * @response 400 If validation fails
   * @response 500 If a server error occurs
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
        HttpResponse.notFound(res, NotFoundExceptionMessages.MOVIE_NOT_FOUND);
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
   * Deletes a movie from the database
   *
   * @param req Express request containing the movie ID in the route parameters
   * @param res Express response object
   * @returns Promise<void>
   *
   * @throws Will delegate errors to the HttpResponse handler
   * @response 204 If the movie was successfully deleted (no content)
   * @response 404 If the movie is not found
   * @response 500 If a server error occurs
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
