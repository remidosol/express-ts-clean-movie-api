import { Request } from "express";
import { CONFIG, Config } from "../../../infrastructure/config";
import { container } from "../../../infrastructure/di/container";
import { createRouter } from "../../../shared/utils";
import {
  CreateMovieDto,
  MovieParamsDto,
  MovieQueryDto,
  UpdateMovieDto,
} from "../../dtos/request/movie";
import { MovieController } from "../controllers/MovieController";
import { cacheMiddleware } from "../middleware";

export const movieRouter = async (movieController: MovieController) => {
  const config = container.resolve<Config>(CONFIG);

  const { router, get, post, patch, delete: del } = createRouter();

  get("/", {
    queryValidation: MovieQueryDto,
    handlers: [
      ...(config.getOrThrow("NODE_ENV") !== "test"
        ? [
            await cacheMiddleware({
              key: (req: Request) =>
                `movies:${req.query.page}:${req.query.limit}`,
              ttl: 5 * 60 * 1000, // Cache for 5 minutes
            }),
          ]
        : []),
      (req, res) => movieController.getAllMovies(req, res),
    ],
    transform: true,
  });

  post("/", {
    bodyValidation: CreateMovieDto,
    handlers: [(req, res) => movieController.createMovie(req, res)],
    transform: true,
  });

  get("/:id", {
    paramsValidation: MovieParamsDto,
    handlers: [(req, res) => movieController.getMovieById(req, res)],
    transform: true,
  });

  patch("/:id", {
    paramsValidation: MovieParamsDto,
    bodyValidation: UpdateMovieDto,
    handlers: [(req, res) => movieController.updateMovie(req, res)],
    transform: true,
  });

  del("/:id", {
    paramsValidation: MovieParamsDto,
    handlers: [(req, res) => movieController.deleteMovie(req, res)],
    transform: true,
  });

  return router;
};
