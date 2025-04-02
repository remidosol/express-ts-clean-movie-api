import { MovieApplicationService } from "../../../../../src/application/services";
import { UpdateMovieUseCase } from "../../../../../src/application/use-cases/movie/UpdateMovieUseCase";
import { MovieRepository } from "../../../../../src/domain/repositories/MovieRepository";
import {
  LOGGER,
  Logger,
} from "../../../../../src/infrastructure/logger/Logger";
import { container } from "../../../../jest-setup";

describe("UpdateMovieUseCase", () => {
  let mockLogger: any;
  let mockMovieRepository: any;
  let mockMovieApplicationService: any;
  let updateMovieUseCase: UpdateMovieUseCase;

  beforeEach(() => {
    // Resolve mocks from container
    mockLogger = container.resolve<Logger>(LOGGER);
    mockMovieRepository = container.resolve<MovieRepository>("MovieRepository");
    mockMovieApplicationService = container.resolve<MovieApplicationService>(
      MovieApplicationService.name
    );

    // Create use case with resolved dependencies
    updateMovieUseCase = new UpdateMovieUseCase(
      mockLogger,
      mockMovieRepository,
      mockMovieApplicationService
    );
  });

  it("should update a movie successfully", async () => {
    // Arrange
    const movieId = "507f1f77bcf86cd799439011";
    const movieData = {
      title: "Updated Title",
      description: "Updated Description",
    };

    const updatedMovie = {
      id: movieId,
      ...movieData,
      releaseDate: new Date("1999-03-31"),
      genre: "Sci-Fi",
      rating: 8.7,
      imdbId: "tt0133093",
      director: "507f1f77bcf86cd799439012",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockMovieRepository.update.mockResolvedValue(updatedMovie);

    // Act
    const result = await updateMovieUseCase.execute(movieId, movieData);

    // Assert
    expect(mockMovieRepository.update).toHaveBeenCalledWith(movieId, movieData);
    expect(result).toBeDefined();
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Updating movie",
      expect.any(Object)
    );
  });

  it("should check director exists when director is provided", async () => {
    // Arrange
    const movieId = "507f1f77bcf86cd799439011";
    const directorId = "507f1f77bcf86cd799439012";
    const movieData = {
      title: "Updated Title",
      director: directorId,
    };

    mockMovieApplicationService.directorExists.mockResolvedValue(true);
    mockMovieRepository.update.mockResolvedValue({
      id: movieId,
      ...movieData,
      releaseDate: new Date("1999-03-31"),
      genre: "Sci-Fi",
      imdbId: "tt0133093",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Act
    const result = await updateMovieUseCase.execute(movieId, movieData);

    // Assert
    expect(mockMovieApplicationService.directorExists).toHaveBeenCalledWith(
      directorId
    );
    expect(mockMovieRepository.update).toHaveBeenCalledWith(movieId, movieData);
    expect(result).toBeDefined();
  });

  it("should return null when director does not exist", async () => {
    // Arrange
    const movieId = "507f1f77bcf86cd799439011";
    const directorId = "507f1f77bcf86cd799439012";
    const movieData = {
      title: "Updated Title",
      director: directorId,
    };

    mockMovieApplicationService.directorExists.mockResolvedValue(false);

    // Act
    const result = await updateMovieUseCase.execute(movieId, movieData);

    // Assert
    expect(mockMovieApplicationService.directorExists).toHaveBeenCalledWith(
      directorId
    );
    expect(mockMovieRepository.update).not.toHaveBeenCalled();
    expect(result).toBeNull();
    expect(mockLogger.debug).toHaveBeenCalledWith("Director not found");
  });

  it("should return null when movie does not exist", async () => {
    // Arrange
    const movieId = "507f1f77bcf86cd799439011";
    const movieData = {
      title: "Updated Title",
    };

    mockMovieRepository.update.mockResolvedValue(null);

    // Act
    const result = await updateMovieUseCase.execute(movieId, movieData);

    // Assert
    expect(mockMovieRepository.update).toHaveBeenCalledWith(movieId, movieData);
    expect(result).toBeNull();
  });

  it("should throw error when repository throws", async () => {
    // Arrange
    const movieId = "507f1f77bcf86cd799439011";
    const movieData = {
      title: "Updated Title",
    };
    const error = new Error("Database error");

    mockMovieRepository.update.mockRejectedValue(error);

    // Act & Assert
    await expect(
      updateMovieUseCase.execute(movieId, movieData)
    ).rejects.toThrow(error);
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Failed to update movie",
      expect.any(Object)
    );
  });
});
