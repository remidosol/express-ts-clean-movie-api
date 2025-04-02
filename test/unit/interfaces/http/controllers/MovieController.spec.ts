import { Request, Response } from "express";
import {
  CreateMovieUseCase,
  DeleteMovieUseCase,
  GetAllMoviesUseCase,
  GetMovieByIdUseCase,
  UpdateMovieUseCase,
} from "../../../../../src/application/use-cases/movie";
import { Logger } from "../../../../../src/infrastructure/logger/Logger";
import { NotFoundExceptionMessages } from "../../../../../src/interfaces/constants/exception-messages";
import { MovieController } from "../../../../../src/interfaces/http/controllers/MovieController";
import { HttpResponse } from "../../../../../src/interfaces/http/response";
import { container } from "../../../../jest-setup";

// Mock dependencies
jest.mock("../../../../../src/interfaces/http/response/HttpResponse", () => {
  return {
    HttpResponse: {
      ok: jest.fn(),
      created: jest.fn(),
      noContent: jest.fn(),
      notFound: jest.fn(),
      badRequest: jest.fn(),
      internalServerError: jest.fn(),
      handleError: jest.fn(),
    },
  };
});

describe("MovieController", () => {
  let mockLogger: any;
  let mockCreateMovieUseCase: any;
  let mockGetAllMoviesUseCase: any;
  let mockGetMovieByIdUseCase: any;
  let mockUpdateMovieUseCase: any;
  let mockDeleteMovieUseCase: any;
  let controller: MovieController;

  beforeEach(() => {
    // Resolve mocks from container
    mockLogger = container.resolve<Logger>(Logger);
    mockCreateMovieUseCase = container.resolve<CreateMovieUseCase>(
      CreateMovieUseCase.name
    );
    mockGetAllMoviesUseCase = container.resolve<GetAllMoviesUseCase>(
      GetAllMoviesUseCase.name
    );
    mockGetMovieByIdUseCase = container.resolve<GetMovieByIdUseCase>(
      GetMovieByIdUseCase.name
    );
    mockUpdateMovieUseCase = container.resolve<UpdateMovieUseCase>(
      UpdateMovieUseCase.name
    );
    mockDeleteMovieUseCase = container.resolve<DeleteMovieUseCase>(
      DeleteMovieUseCase.name
    );

    // Create controller with resolved dependencies
    controller = new MovieController(
      mockLogger,
      mockCreateMovieUseCase,
      mockGetAllMoviesUseCase,
      mockGetMovieByIdUseCase,
      mockUpdateMovieUseCase,
      mockDeleteMovieUseCase
    );
  });

  describe("createMovie", () => {
    it("should create a movie successfully", async () => {
      // Arrange
      const req = {
        body: {
          title: "Test Movie",
          description: "Test Description",
          releaseDate: new Date(),
          genre: "Test",
          rating: 5,
          imdbId: "tt1234567",
          director: "507f1f77bcf86cd799439011",
        },
      } as Request;

      const res = {} as Response;
      const movieResult = { id: "123", title: "Test Movie" };

      mockCreateMovieUseCase.execute.mockResolvedValue(movieResult);

      // Act
      await controller.createMovie(req, res);

      // Assert
      expect(mockCreateMovieUseCase.execute).toHaveBeenCalledWith(req.body);
      expect(HttpResponse.created).toHaveBeenCalledWith(res, movieResult);
    });

    it("should handle errors", async () => {
      // Arrange
      const req = {
        body: {
          title: "Test Movie",
        },
      } as Request;

      const res = {} as Response;
      const error = new Error("Test error");

      mockCreateMovieUseCase.execute.mockRejectedValue(error);

      // Act
      await controller.createMovie(req, res);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error creating movie",
        expect.any(Object)
      );
      expect(HttpResponse.handleError).toHaveBeenCalledWith(res, error);
    });
  });

  describe("getMovies", () => {
    it("should get all movies", async () => {
      // Arrange
      const req = {
        query: {},
      } as unknown as Request;

      const res = {} as Response;
      const movies = {
        data: [{ id: "123", title: "Test Movie" }],
        pagination: {},
      };

      mockGetAllMoviesUseCase.execute.mockResolvedValue(movies);

      // Act
      await controller.getAllMovies(req, res);

      // Assert
      expect(mockGetAllMoviesUseCase.execute).toHaveBeenCalledWith({});
      expect(HttpResponse.ok).toHaveBeenCalledWith(res, movies);
    });

    it("should handle query parameters", async () => {
      // Arrange
      const req = {
        query: {
          page: "2",
          limit: "10",
          sortBy: "title",
          sortDir: "asc",
          title: "Test",
        },
      } as unknown as Request;

      const res = {} as Response;
      const movies = {
        data: [{ id: "123", title: "Test Movie" }],
        pagination: {},
      };

      mockGetAllMoviesUseCase.execute.mockResolvedValue(movies);

      // Act
      await controller.getAllMovies(req, res);

      // Assert
      expect(mockGetAllMoviesUseCase.execute).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        sortBy: "title",
        sortDir: "asc",
        filters: { title: "Test" },
      });
      expect(HttpResponse.ok).toHaveBeenCalledWith(res, movies);
    });
  });

  describe("getMovieById", () => {
    it("should get a movie by id successfully", async () => {
      // Arrange
      const req = {
        params: { id: "123" },
      } as unknown as Request;

      const res = {} as Response;
      const movie = { id: "123", title: "Test Movie" };

      mockGetMovieByIdUseCase.execute.mockResolvedValue(movie);

      // Act
      await controller.getMovieById(req, res);

      // Assert
      expect(mockGetMovieByIdUseCase.execute).toHaveBeenCalledWith("123");
      expect(HttpResponse.ok).toHaveBeenCalledWith(res, movie);
    });

    it("should return not found when movie doesn't exist", async () => {
      // Arrange
      const req = {
        params: { id: "123" },
      } as unknown as Request;

      const res = {} as Response;

      mockGetMovieByIdUseCase.execute.mockResolvedValue(null);

      // Act
      await controller.getMovieById(req, res);

      // Assert
      expect(mockGetMovieByIdUseCase.execute).toHaveBeenCalledWith("123");
      expect(HttpResponse.notFound).toHaveBeenCalledWith(
        res,
        NotFoundExceptionMessages.MOVIE_NOT_FOUND
      );
    });
  });

  describe("updateMovie", () => {
    it("should update a movie successfully", async () => {
      // Arrange
      const req = {
        params: { id: "123" },
        body: { title: "Updated Title" },
      } as unknown as Request;

      const res = {} as Response;
      const movie = { id: "123", title: "Updated Title" };

      mockUpdateMovieUseCase.execute.mockResolvedValue(movie);

      // Act
      await controller.updateMovie(req, res);

      // Assert
      expect(mockUpdateMovieUseCase.execute).toHaveBeenCalledWith(
        "123",
        req.body
      );
      expect(HttpResponse.ok).toHaveBeenCalledWith(res, movie);
    });

    it("should return not found when movie doesn't exist", async () => {
      // Arrange
      const req = {
        params: { id: "123" },
        body: { title: "Updated Title" },
      } as unknown as Request;

      const res = {} as Response;

      mockUpdateMovieUseCase.execute.mockResolvedValue(null);

      // Act
      await controller.updateMovie(req, res);

      // Assert
      expect(HttpResponse.notFound).toHaveBeenCalledWith(
        res,
        NotFoundExceptionMessages.MOVIE_NOT_FOUND
      );
    });
  });

  describe("deleteMovie", () => {
    it("should delete a movie successfully", async () => {
      // Arrange
      const req = {
        params: { id: "123" },
      } as unknown as Request;

      const res = {} as Response;

      mockDeleteMovieUseCase.execute.mockResolvedValue(true);

      // Act
      await controller.deleteMovie(req, res);

      // Assert
      expect(mockDeleteMovieUseCase.execute).toHaveBeenCalledWith("123");
      expect(HttpResponse.noContent).toHaveBeenCalledWith(res);
    });

    it("should return not found when movie doesn't exist", async () => {
      // Arrange
      const req = {
        params: { id: "123" },
      } as unknown as Request;

      const res = {} as Response;

      mockDeleteMovieUseCase.execute.mockResolvedValue(false);

      // Act
      await controller.deleteMovie(req, res);

      // Assert
      expect(HttpResponse.notFound).toHaveBeenCalledWith(
        res,
        NotFoundExceptionMessages.MOVIE_NOT_FOUND
      );
    });
  });
});
