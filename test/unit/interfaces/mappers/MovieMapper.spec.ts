import { Types } from "mongoose";
import { Movie } from "../../../../src/domain/entities";
import {
  CreateMovieDto,
  UpdateMovieDto,
} from "../../../../src/interfaces/dtos/request/movie";
import { MovieDto } from "../../../../src/interfaces/dtos/response/movie";
import { MovieMapper } from "../../../../src/interfaces/mappers";
import { createMockMovie } from "../../../jest-setup";

describe("MovieMapper", () => {
  describe("toMovieDto", () => {
    it("should map a Movie entity to MovieDto", () => {
      // Arrange
      const now = new Date();
      const directorId = new Types.ObjectId().toString();

      // Use helper from jest-setup to create a movie
      const movie = createMockMovie({
        id: "123",
        title: "Inception",
        description: "A mind-bending thriller",
        releaseDate: now,
        genre: "Sci-Fi",
        rating: 8.8,
        imdbId: "tt1375666",
        director: {
          id: directorId,
          firstName: "Christopher",
          secondName: "Nolan",
          birthDate: now,
          bio: "Film director",
          createdAt: now,
          updatedAt: now,
        },
        createdAt: now,
        updatedAt: now,
      });

      // Act
      const result = MovieMapper.toMovieDto(movie);

      // Assert
      expect(result).toEqual({
        id: "123",
        title: "Inception",
        description: "A mind-bending thriller",
        releaseDate: now,
        genre: "Sci-Fi",
        rating: 8.8,
        imdbId: "tt1375666",
        director: {
          id: directorId,
          firstName: "Christopher",
          secondName: "Nolan",
        },
        createdAt: now,
        updatedAt: now,
      });
    });

    it("should handle string director ID", () => {
      // Arrange
      const now = new Date();
      const directorId = new Types.ObjectId().toString();

      const movie: Movie = {
        id: "123",
        title: "Inception",
        description: "A mind-bending thriller",
        releaseDate: now,
        genre: "Sci-Fi",
        rating: 8.8,
        imdbId: "tt1375666",
        director: directorId,
        createdAt: now,
        updatedAt: now,
      };

      // Act
      const result = MovieMapper.toMovieDto(movie);

      // Assert
      expect(result.director).toEqual(directorId);
    });
  });

  describe("fromCreateDto", () => {
    it("should map CreateMovieDto to Movie entity", () => {
      // Arrange
      const now = new Date();
      const directorId = new Types.ObjectId().toString();

      const createDto: CreateMovieDto = {
        title: "Inception",
        description: "A mind-bending thriller",
        releaseDate: now,
        genre: "Sci-Fi",
        rating: 8.8,
        imdbId: "tt1375666",
        director: directorId,
      };

      // Act
      const result = MovieMapper.fromCreateDto(createDto);

      // Assert
      expect(result).toEqual({
        title: "Inception",
        description: "A mind-bending thriller",
        releaseDate: now,
        genre: "Sci-Fi",
        rating: 8.8,
        imdbId: "tt1375666",
        director: directorId,
      });
    });
  });

  describe("fromUpdateDto", () => {
    it("should map UpdateMovieDto to partial Movie entity", () => {
      // Arrange
      const updateDto: UpdateMovieDto = {
        title: "Updated Title",
        description: "Updated description",
      };

      // Act
      const result = MovieMapper.fromUpdateDto(updateDto);

      // Assert
      expect(result).toEqual({
        title: "Updated Title",
        description: "Updated description",
      });
    });
  });

  describe("toCreateMovieResponseDto", () => {
    it("should map MovieDto to CreateMovieResponseDto", () => {
      // Arrange
      const now = new Date();
      const movieDto: MovieDto = {
        id: "123",
        title: "Inception",
        description: "A mind-bending thriller",
        releaseDate: now,
        genre: "Sci-Fi",
        rating: 8.8,
        imdbId: "tt1375666",
        director: {
          id: "456",
          firstName: "Christopher",
          secondName: "Nolan",
          bio: "Film director",
          birthDate: now,
          createdAt: now,
          updatedAt: now,
        },
        createdAt: now,
        updatedAt: now,
      };

      // Act
      const result = MovieMapper.toCreateMovieResponseDto(movieDto);

      // Assert
      expect(result).toEqual(movieDto);
    });
  });
});
