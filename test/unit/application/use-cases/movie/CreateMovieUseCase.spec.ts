import { MovieApplicationService } from "../../../../../src/application/services";
import { CreateMovieUseCase } from "../../../../../src/application/use-cases/movie/CreateMovieUseCase";
import { MovieRepository } from "../../../../../src/domain/repositories";
import {
  LOGGER,
  Logger,
} from "../../../../../src/infrastructure/logger/Logger";
import { MongoMovieRepository } from "../../../../../src/infrastructure/repositories";
import { container } from "../../../../jest-setup";

describe("CreateMovieUseCase", () => {
  let mockLogger: any;
  let mockMovieRepository: any;
  let mockMovieApplicationService: any;
  let createMovieUseCase: CreateMovieUseCase;

  beforeEach(() => {
    mockLogger = container.resolve<Logger>(LOGGER);
    mockMovieRepository = container.resolve<MovieRepository>(
      MongoMovieRepository.name
    );
    mockMovieApplicationService = container.resolve<MovieApplicationService>(
      MovieApplicationService.name
    );
    createMovieUseCase = new CreateMovieUseCase(
      mockLogger,
      mockMovieRepository,
      mockMovieApplicationService
    );
  });

  it("should create a movie successfully when director exists", async () => {
    // Arrange
    const directorId = "507f1f77bcf86cd799439011";
    const movieData = {
      title: "The Matrix",
      description: "A computer hacker learns about the true nature of reality",
      releaseDate: new Date("1999-03-31"),
      genre: "Sci-Fi",
      rating: 8.7,
      imdbId: "tt0133093",
      director: directorId,
    };

    const createdMovie = {
      ...movieData,
      id: "123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockMovieApplicationService.directorExists.mockResolvedValue(true);
    mockMovieRepository.create.mockResolvedValue(createdMovie);

    // Act
    const result = await createMovieUseCase.execute(movieData as any);

    // Assert
    expect(mockMovieApplicationService.directorExists).toHaveBeenCalledWith(
      directorId
    );
    expect(mockMovieRepository.create).toHaveBeenCalledWith(movieData);
    expect(result).toBeDefined();
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Creating new movie",
      expect.any(Object)
    );
  });

  it("should return null when director does not exist", async () => {
    // Arrange
    const directorId = "507f1f77bcf86cd799439011";
    const movieData = {
      title: "The Matrix",
      description: "A computer hacker learns about the true nature of reality",
      releaseDate: new Date("1999-03-31"),
      genre: "Sci-Fi",
      rating: 8.7,
      imdbId: "tt0133093",
      director: directorId,
    };

    mockMovieApplicationService.directorExists.mockResolvedValue(false);

    // Act
    const result = await createMovieUseCase.execute(movieData as any);

    // Assert
    expect(mockMovieApplicationService.directorExists).toHaveBeenCalledWith(
      directorId
    );
    expect(mockMovieRepository.create).not.toHaveBeenCalled();
    expect(result).toBeNull();
    expect(mockLogger.debug).toHaveBeenCalledWith("Director not found");
  });

  it("should throw error when repository throws", async () => {
    // Arrange
    const directorId = "507f1f77bcf86cd799439011";
    const movieData = {
      title: "The Matrix",
      description: "A computer hacker learns about the true nature of reality",
      releaseDate: new Date("1999-03-31"),
      genre: "Sci-Fi",
      rating: 8.7,
      imdbId: "tt0133093",
      director: directorId,
    };

    const error = new Error("Database error");

    mockMovieApplicationService.directorExists.mockResolvedValue(true);
    mockMovieRepository.create.mockRejectedValue(error);

    // Act & Assert
    await expect(createMovieUseCase.execute(movieData as any)).rejects.toThrow(
      error
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Failed to create movie",
      expect.any(Object)
    );
  });
});
