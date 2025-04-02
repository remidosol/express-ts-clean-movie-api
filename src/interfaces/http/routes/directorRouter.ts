import { createRouter } from "../../../shared/utils";
import {
  CreateDirectorDto,
  DirectorParamsDto,
} from "../../dtos/request/director";
import { DirectorController } from "../controllers/DirectorController";

export const directorRouter = async (
  directorController: DirectorController
) => {
  const { router, post, delete: del } = createRouter();

  post("/", {
    bodyValidation: CreateDirectorDto,
    handlers: [(req, res) => directorController.createDirector(req, res)],
    transform: true,
  });

  del("/:id", {
    paramsValidation: DirectorParamsDto,
    handlers: [(req, res) => directorController.deleteDirector(req, res)],
    transform: true,
  });

  return router;
};
