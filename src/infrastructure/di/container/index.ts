import { container, Lifecycle } from "tsyringe";
import {
  CreateDirectorUseCase,
  DeleteDirectorUseCase,
} from "../../../application/use-cases/director";
import {
  CreateMovieUseCase,
  DeleteMovieUseCase,
  GetAllMoviesUseCase,
  GetMovieByIdUseCase,
  UpdateMovieUseCase,
} from "../../../application/use-cases/movie";
import {
  DirectorRepository,
  MovieRepository,
} from "../../../domain/repositories";
import {
  DirectorController,
  MovieController,
} from "../../../interfaces/http/controllers";
import { CACHE, Cache } from "../../cache";
import { CONFIG, Config } from "../../config";
import { LOGGER, Logger } from "../../logger/Logger";
import { LOGGER_BASE, WinstonLogger } from "../../logger/winston/winstonLogger";
import {
  MongoDirectorRepository,
  MongoMovieRepository,
} from "../../repositories";

// Register infrastructure classes with the container
container.registerSingleton<Config>(CONFIG, Config);
container.registerSingleton<WinstonLogger>(LOGGER_BASE, WinstonLogger);
container.register<Logger>(LOGGER, Logger, { lifecycle: Lifecycle.Transient });

const logger = container.resolve<Logger>(LOGGER);
logger.setOrganizationAndContext("DI Container");

logger.info("DI Container initialization started");
container.registerSingleton<Cache>(CACHE, Cache);
logger.debug("Cache registered");

// Register repositories with the container
container.registerSingleton<MovieRepository>(
  "MovieRepository",
  MongoMovieRepository
);
logger.debug("MovieRepository registered");
container.registerSingleton<DirectorRepository>(
  "DirectorRepository",
  MongoDirectorRepository
);
logger.debug("DirectorRepository registered");

// Register movie use-cases with the container
container.registerSingleton<CreateMovieUseCase>(
  CreateMovieUseCase.name,
  CreateMovieUseCase
);
logger.debug("CreateMovieUseCase registered");
container.registerSingleton<GetAllMoviesUseCase>(
  GetAllMoviesUseCase.name,
  GetAllMoviesUseCase
);
logger.debug("GetAllMoviesUseCase registered");
container.registerSingleton<GetMovieByIdUseCase>(
  GetMovieByIdUseCase.name,
  GetMovieByIdUseCase
);
logger.debug("GetMovieByIdUseCase registered");
container.registerSingleton<UpdateMovieUseCase>(
  UpdateMovieUseCase.name,
  UpdateMovieUseCase
);
logger.debug("UpdateMovieUseCase registered");
container.registerSingleton<DeleteMovieUseCase>(
  DeleteMovieUseCase.name,
  DeleteMovieUseCase
);
logger.debug("DeleteMovieUseCase registered");

// Register director use-cases with the container
container.registerSingleton<CreateDirectorUseCase>(
  CreateDirectorUseCase.name,
  CreateDirectorUseCase
);
logger.debug("CreateDirectorUseCase registered");
container.registerSingleton<DeleteDirectorUseCase>(
  DeleteDirectorUseCase.name,
  DeleteDirectorUseCase
);
logger.debug("DeleteDirectorUseCase registered");

// Register controllers with the container
container.registerSingleton<MovieController>(
  MovieController.name,
  MovieController
);
logger.debug("MovieController registered");
container.registerSingleton<DirectorController>(
  DirectorController.name,
  DirectorController
);
logger.debug("DirectorController registered");

logger.info("DI Container initialized");

export { container };
