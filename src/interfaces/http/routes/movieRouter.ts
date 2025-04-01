import { createRouter } from "../../../shared/utils";
import {
  CreateMovieDto,
  MovieParamsDto,
  MovieQueryDto,
  UpdateMovieDto,
} from "../../dtos/request/movie";
import { MovieController } from "../controllers/MovieController";

export const movieRouter = (movieController: MovieController) => {
  const { router, get, post, patch, delete: del } = createRouter();

  get("/", {
    queryValidation: MovieQueryDto,
    handlers: [(req, res) => movieController.getAllMovies(req, res)],
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
