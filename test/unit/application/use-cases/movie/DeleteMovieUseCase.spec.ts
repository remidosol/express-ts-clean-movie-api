import { DeleteMovieUseCase } from "../../../../../src/application/use-cases/movie/DeleteMovieUseCase";
import { MovieRepository } from "../../../../../src/domain/repositories/MovieRepository";
import {
  LOGGER,
  Logger,
} from "../../../../../src/infrastructure/logger/Logger";
import { container } from "../../../../jest-setup";

describe("DeleteMovieUseCase", () => {
  let mockLogger: any;
  let mockMovieRepository: any;
  let deleteMovieUseCase: DeleteMovieUseCase;

  beforeEach(() => {
    // Resolve mocks from container
    mockLogger = container.resolve<Logger>(LOGGER);
    mockMovieRepository = container.resolve<MovieRepository>("MovieRepository");

    // Create use case with resolved dependencies
    deleteMovieUseCase = new DeleteMovieUseCase(
      mockLogger,
      mockMovieRepository
    );
  });

  it("should delete a movie successfully", async () => {
    // Arrange
    const movieId = "507f1f77bcf86cd799439011";
    mockMovieRepository.delete.mockResolvedValue(true);

    // Act
    const result = await deleteMovieUseCase.execute(movieId);

    // Assert
    expect(mockMovieRepository.delete).toHaveBeenCalledWith(movieId);
    expect(result).toBe(true);
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Deleting movie",
      expect.any(Object)
    );
  });

  it("should return false when movie does not exist", async () => {
    // Arrange
    const movieId = "507f1f77bcf86cd799439011";
    mockMovieRepository.delete.mockResolvedValue(false);

    // Act
    const result = await deleteMovieUseCase.execute(movieId);

    // Assert
    expect(mockMovieRepository.delete).toHaveBeenCalledWith(movieId);
    expect(result).toBe(false);
  });

  it("should throw error when repository throws", async () => {
    // Arrange
    const movieId = "507f1f77bcf86cd799439011";
    const error = new Error("Database error");
    mockMovieRepository.delete.mockRejectedValue(error);

    // Act & Assert
    await expect(deleteMovieUseCase.execute(movieId)).rejects.toThrow(error);
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Failed to delete movie",
      expect.any(Object)
    );
  });
});
