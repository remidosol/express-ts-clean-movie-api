import { Express } from "express";
import { container } from "../infrastructure/di/container";
import { DirectorController } from "../interfaces/http/controllers/DirectorController";
import { MovieController } from "../interfaces/http/controllers/MovieController";
import { directorRouter, movieRouter } from "../interfaces/http/routes";

export function registerRoutes(app: Express): void {
  const movieController = container.resolve<MovieController>(MovieController);
  const directorController =
    container.resolve<DirectorController>(DirectorController);

  // Define API routes
  app.use("/api/movies", movieRouter(movieController));
  app.use("/api/directors", directorRouter(directorController));
}
