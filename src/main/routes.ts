import { Express, Router } from "express";
import { container } from "../infrastructure/di/container";
import { DirectorController } from "../interfaces/http/controllers/DirectorController";
import { MovieController } from "../interfaces/http/controllers/MovieController";
import { directorRouter, movieRouter } from "../interfaces/http/routes";

export async function registerRoutes(app: Express): Promise<void> {
  const movieController = container.resolve<MovieController>(
    MovieController.name
  );
  const directorController = container.resolve<DirectorController>(
    DirectorController.name
  );

  // Create a router with global prefix
  const apiRouter = Router();

  // Mount routes to the API router without the "/api" prefix
  apiRouter.use("/movies", await movieRouter(movieController));
  apiRouter.use("/directors", await directorRouter(directorController));

  // Mount the API router to the app with the "/api" prefix
  app.use("/api/v1", apiRouter);
}
