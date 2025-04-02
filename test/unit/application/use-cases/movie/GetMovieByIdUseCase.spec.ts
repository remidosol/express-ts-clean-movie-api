import { GetMovieByIdUseCase } from "../../../../../src/application/use-cases/movie/GetMovieByIdUseCase";
import { MovieRepository } from "../../../../../src/domain/repositories/MovieRepository";
import {
  LOGGER,
  Logger,
} from "../../../../../src/infrastructure/logger/Logger";
import { container } from "../../../../jest-setup";

describe("GetMovieByIdUseCase", () => {
  let mockLogger: any;
  let mockMovieRepository: any;
  let getMovieByIdUseCase: GetMovieByIdUseCase;

  beforeEach(() => {
    // Resolve mocks from container
    mockLogger = container.resolve<Logger>(LOGGER);
    mockMovieRepository = container.resolve<MovieRepository>("MovieRepository");

    // Create use case with resolved dependencies
    getMovieByIdUseCase = new GetMovieByIdUseCase(
      mockLogger,
      mockMovieRepository
    );
  });

  it("should get a movie by id successfully", async () => {
    // Arrange
    const movieId = "507f1f77bcf86cd799439011";
    const mockMovie = {
      id: movieId,
      title: "The Matrix",
      description: "A computer hacker learns about the true nature of reality",
      releaseDate: new Date("1999-03-31"),
      genre: "Sci-Fi",
      rating: 8.7,
      imdbId: "tt0133093",
      director: "507f1f77bcf86cd799439012",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockMovieRepository.findById.mockResolvedValue(mockMovie);

    // Act
    const result = await getMovieByIdUseCase.execute(movieId);

    // Assert
    expect(mockMovieRepository.findById).toHaveBeenCalledWith(movieId);
    expect(result).toBeDefined();
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Getting movie by id",
      expect.any(Object)
    );
  });

  it("should return null when movie does not exist", async () => {
    // Arrange
    const movieId = "507f1f77bcf86cd799439011";
    mockMovieRepository.findById.mockResolvedValue(null);

    // Act
    const result = await getMovieByIdUseCase.execute(movieId);

    // Assert
    expect(mockMovieRepository.findById).toHaveBeenCalledWith(movieId);
    expect(result).toBeNull();
  });

  it("should throw error when repository throws", async () => {
    // Arrange
    const movieId = "507f1f77bcf86cd799439011";
    const error = new Error("Database error");
    mockMovieRepository.findById.mockRejectedValue(error);

    // Act & Assert
    await expect(getMovieByIdUseCase.execute(movieId)).rejects.toThrow(error);
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Failed to get movie by id",
      expect.any(Object)
    );
  });
});
