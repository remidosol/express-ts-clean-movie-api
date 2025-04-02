import "reflect-metadata";
import mongoose, { Types } from "mongoose";
import { container } from "tsyringe";
import { MovieApplicationService } from "../src/application/services";
import {
  CreateDirectorUseCase,
  DeleteDirectorUseCase,
} from "../src/application/use-cases/director";
import {
  CreateMovieUseCase,
  DeleteMovieUseCase,
  GetAllMoviesUseCase,
  GetMovieByIdUseCase,
  UpdateMovieUseCase,
} from "../src/application/use-cases/movie";
import { Director } from "../src/domain/entities/Director";
import { Movie } from "../src/domain/entities/Movie";
import {
  DirectorRepository,
  MovieRepository,
} from "../src/domain/repositories";
import { CACHE, Cache } from "../src/infrastructure/cache";
import { CONFIG, Config } from "../src/infrastructure/config";
import { LOGGER, Logger } from "../src/infrastructure/logger/Logger";
import {
  LOGGER_BASE,
  WinstonLogger,
} from "../src/infrastructure/logger/winston/winstonLogger";

// Create mock implementations

// Infrastructure mocks
export const mockLogger = {
  setOrganizationAndContext: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  startProfile: jest.fn(),
};

export const mockWinstonLogger = {
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  startProfile: jest.fn(),
};

export const mockConfig = {
  get: jest.fn().mockImplementation((key: string) => {
    if (key === "APP_NAME") return "test-app";
    if (key === "CACHE_TTL") return "60000";
    return undefined;
  }),
  getOrThrow: jest.fn().mockImplementation((key: string) => {
    if (key === "APP_NAME") return "test-app";
    if (key === "HOST") return "localhost";
    if (key === "PORT") return "3333";
    if (key === "REQUEST_ID_HEADER_NAME") return "X-Request-ID";
    return "mock-value";
  }),
};

export const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  getTtl: jest.fn().mockReturnValue(60000),
  isUsingRedis: jest.fn().mockReturnValue(false),
};

// Repository mocks
export const mockMovieRepository = {
  findById: jest.fn(),
  findAll: jest.fn(),
  getCount: jest.fn(),
  findByDirector: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const mockDirectorRepository = {
  findById: jest.fn(),
  exists: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

// Mapper mocks
export const mockMongoMovieMapper = {
  toEntity: jest.fn(),
  toDocument: jest.fn(),
};

export const mockMongoDirectorMapper = {
  toEntity: jest.fn(),
  toDocument: jest.fn(),
};

// Model mocks
export const mockMovieModel = {
  find: jest.fn().mockReturnValue({
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockResolvedValue([]),
  }),
  findOne: jest.fn(),
  findById: jest.fn().mockReturnValue({
    populate: jest.fn().mockResolvedValue(null),
  }),
  countDocuments: jest.fn().mockResolvedValue(0),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

export const mockDirectorModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
};

// Application service mocks
export const mockMovieApplicationService = {
  directorExists: jest.fn(),
};

// Use case mocks
export const mockCreateMovieUseCase = {
  execute: jest.fn(),
};

export const mockGetAllMoviesUseCase = {
  execute: jest.fn(),
};

export const mockGetMovieByIdUseCase = {
  execute: jest.fn(),
};

export const mockUpdateMovieUseCase = {
  execute: jest.fn(),
};

export const mockDeleteMovieUseCase = {
  execute: jest.fn(),
};

export const mockCreateDirectorUseCase = {
  execute: jest.fn(),
};

export const mockDeleteDirectorUseCase = {
  execute: jest.fn(),
};

// HTTP response mock
export const mockHttpResponse = {
  ok: jest.fn(),
  created: jest.fn(),
  noContent: jest.fn(),
  notFound: jest.fn(),
  badRequest: jest.fn(),
  internalServerError: jest.fn(),
  handleError: jest.fn(),
};

// Mock HttpResponse module
jest.mock("../src/interfaces/http/response/HttpResponse", () => ({
  HttpResponse: mockHttpResponse,
}));

// Mock mapper modules
jest.mock("../src/infrastructure/mappers/MongoMovieMapper", () => ({
  MongoMovieMapper: mockMongoMovieMapper,
}));

jest.mock("../src/infrastructure/mappers/MongoDirectorMapper", () => ({
  MongoDirectorMapper: mockMongoDirectorMapper,
}));

// Before each test
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clear the container to avoid state leakage between tests
  container.clearInstances();

  // Register mock infrastructure classes
  container.registerInstance<Config>(CONFIG, mockConfig as unknown as Config);
  container.registerInstance<WinstonLogger>(
    LOGGER_BASE,
    mockWinstonLogger as unknown as WinstonLogger
  );
  container.registerInstance<Logger>(LOGGER, mockLogger as unknown as Logger);
  container.registerInstance<Cache>(CACHE, mockCache as unknown as Cache);

  // Register mock mongoose models
  container.registerInstance("MovieModel", mockMovieModel);
  container.registerInstance("DirectorModel", mockDirectorModel);

  // Register mock repositories
  container.registerInstance<MovieRepository>(
    "MovieRepository",
    mockMovieRepository as unknown as MovieRepository
  );
  container.registerInstance<DirectorRepository>(
    "DirectorRepository",
    mockDirectorRepository as unknown as DirectorRepository
  );

  // Register mock application services
  container.registerInstance<MovieApplicationService>(
    MovieApplicationService.name,
    mockMovieApplicationService as unknown as MovieApplicationService
  );

  // Register mock movie use cases
  container.registerInstance<CreateMovieUseCase>(
    CreateMovieUseCase.name,
    mockCreateMovieUseCase as unknown as CreateMovieUseCase
  );
  container.registerInstance<GetAllMoviesUseCase>(
    GetAllMoviesUseCase.name,
    mockGetAllMoviesUseCase as unknown as GetAllMoviesUseCase
  );
  container.registerInstance<GetMovieByIdUseCase>(
    GetMovieByIdUseCase.name,
    mockGetMovieByIdUseCase as unknown as GetMovieByIdUseCase
  );
  container.registerInstance<UpdateMovieUseCase>(
    UpdateMovieUseCase.name,
    mockUpdateMovieUseCase as unknown as UpdateMovieUseCase
  );
  container.registerInstance<DeleteMovieUseCase>(
    DeleteMovieUseCase.name,
    mockDeleteMovieUseCase as unknown as DeleteMovieUseCase
  );

  // Register mock director use cases
  container.registerInstance<CreateDirectorUseCase>(
    CreateDirectorUseCase.name,
    mockCreateDirectorUseCase as unknown as CreateDirectorUseCase
  );
  container.registerInstance<DeleteDirectorUseCase>(
    DeleteDirectorUseCase.name,
    mockDeleteDirectorUseCase as unknown as DeleteDirectorUseCase
  );
});

// After all tests complete
afterAll(async () => {
  // Close any open connections
  await mongoose.disconnect();
});

// Mock console.error to avoid noisy logs during tests
global.console.error = jest.fn();

// Helper functions for tests
export const createMockMovie = (overrides = {}): Movie => {
  const defaultMovie = {
    id: new Types.ObjectId().toString(),
    title: "Test Movie",
    description: "Test Description",
    releaseDate: new Date(),
    genre: "Test Genre",
    rating: 8.0,
    imdbId: "tt1234567",
    director: new Types.ObjectId().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return { ...defaultMovie, ...overrides } as Movie;
};

export const createMockDirector = (overrides = {}): Director => {
  const defaultDirector = {
    id: new Types.ObjectId().toString(),
    firstName: "Test",
    secondName: "Director",
    birthDate: new Date(),
    bio: "Test Bio",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return { ...defaultDirector, ...overrides } as Director;
};

// Export container and mocks for individual tests to use
export { container };
