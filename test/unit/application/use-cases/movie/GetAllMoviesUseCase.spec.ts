import { GetAllMoviesUseCase } from "../../../../../src/application/use-cases/movie/GetAllMoviesUseCase";
import { MovieRepository } from "../../../../../src/domain/repositories/MovieRepository";
import {
  LOGGER,
  Logger,
} from "../../../../../src/infrastructure/logger/Logger";
import { container } from "../../../../jest-setup";

describe("GetAllMoviesUseCase", () => {
  let mockLogger: any;
  let mockMovieRepository: any;
  let getAllMoviesUseCase: GetAllMoviesUseCase;

  beforeEach(() => {
    // Resolve mocks from container
    mockLogger = container.resolve<Logger>(LOGGER);
    mockMovieRepository = container.resolve<MovieRepository>("MovieRepository");

    // Create use case with resolved dependencies
    getAllMoviesUseCase = new GetAllMoviesUseCase(
      mockLogger,
      mockMovieRepository
    );
  });

  it("should get movies with default pagination parameters", async () => {
    // Arrange
    const mockMovies = [
      { id: "1", title: "Movie 1" },
      { id: "2", title: "Movie 2" },
    ];
    mockMovieRepository.findAll.mockResolvedValue(mockMovies);
    mockMovieRepository.getCount.mockResolvedValue(2);

    // Act
    const result = await getAllMoviesUseCase.execute();

    // Assert
    expect(mockMovieRepository.findAll).toHaveBeenCalledWith({
      filters: {},
      pagination: { page: 1, limit: 10 },
      sort: { createdAt: -1 },
      populate: [{ path: "director", select: "id firstName secondName" }],
    });
    expect(mockMovieRepository.getCount).toHaveBeenCalledWith({});
    expect(result.data).toHaveLength(2);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.pages).toBe(1);
  });

  it("should apply provided filters and pagination options", async () => {
    // Arrange
    const mockMovies = [{ id: "1", title: "Movie 1" }];
    mockMovieRepository.findAll.mockResolvedValue(mockMovies);
    mockMovieRepository.getCount.mockResolvedValue(1);

    const options = {
      page: 2,
      limit: 5,
      sortBy: "title" as any,
      sortDir: "asc" as any,
      filters: { genre: "Action" },
    };

    // Act
    const result = await getAllMoviesUseCase.execute(options);

    // Assert
    expect(mockMovieRepository.findAll).toHaveBeenCalledWith({
      filters: { genre: "Action" },
      pagination: { page: 2, limit: 5 },
      sort: { title: 1 },
      populate: expect.any(Array),
    });
    expect(result.data).toHaveLength(1);
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(5);
  });

  it("should throw error when repository throws", async () => {
    // Arrange
    const error = new Error("Database error");
    mockMovieRepository.findAll.mockRejectedValue(error);

    // Act & Assert
    await expect(getAllMoviesUseCase.execute()).rejects.toThrow(error);
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Failed to get movies",
      expect.any(Object)
    );
  });
});
