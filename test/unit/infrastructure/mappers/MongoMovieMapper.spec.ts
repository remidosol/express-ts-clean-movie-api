import { Types } from "mongoose";
import { MongoMovieMapper } from "../../../../src/infrastructure/mappers/MongoMovieMapper";

describe("MongoMovieMapper", () => {
  describe("toEntity", () => {
    it("should convert MongoDB document to domain entity", () => {
      // Arrange
      const directorId = new Types.ObjectId();
      const documentId = new Types.ObjectId();
      const now = new Date();

      const document = {
        _id: documentId,
        title: "Inception",
        description: "A thief who steals corporate secrets",
        releaseDate: now,
        genre: "Sci-Fi",
        rating: 8.8,
        imdbId: "tt1375666",
        director: directorId,
        createdAt: now,
        updatedAt: now,
      };

      // Act
      const result = MongoMovieMapper.toEntity(document as any);

      // Assert
      expect(result).toEqual({
        id: documentId.toString(),
        title: "Inception",
        description: "A thief who steals corporate secrets",
        releaseDate: now,
        genre: "Sci-Fi",
        rating: 8.8,
        imdbId: "tt1375666",
        director: directorId.toString(),
        createdAt: now,
        updatedAt: now,
      });
    });

    it("should handle null or undefined document", () => {
      // Act & Assert
      expect(MongoMovieMapper.toEntity(null)).toBeNull();
      expect(MongoMovieMapper.toEntity(undefined)).toBeNull();
    });

    it("should handle populated director field", () => {
      // Arrange
      const directorId = new Types.ObjectId();
      const documentId = new Types.ObjectId();
      const now = new Date();

      const document = {
        _id: documentId,
        title: "Inception",
        description: "A thief who steals corporate secrets",
        releaseDate: now,
        genre: "Sci-Fi",
        rating: 8.8,
        imdbId: "tt1375666",
        director: {
          _id: directorId,
          firstName: "Christopher",
          secondName: "Nolan",
        },
        createdAt: now,
        updatedAt: now,
      };

      // Act
      const result = MongoMovieMapper.toEntity(document as any);

      // Assert
      expect(result.director).toEqual({
        id: directorId.toString(),
        firstName: "Christopher",
        secondName: "Nolan",
      });
    });
  });

  describe("toDocument", () => {
    it("should convert domain entity to MongoDB document", () => {
      // Arrange
      const directorId = new Types.ObjectId().toString();
      const now = new Date();

      const entity = {
        title: "Inception",
        description: "A thief who steals corporate secrets",
        releaseDate: now,
        genre: "Sci-Fi",
        rating: 8.8,
        imdbId: "tt1375666",
        director: directorId,
      };

      // Act
      const result = MongoMovieMapper.toDocument(entity as any);

      // Assert
      expect(result).toEqual({
        title: "Inception",
        description: "A thief who steals corporate secrets",
        releaseDate: now,
        genre: "Sci-Fi",
        rating: 8.8,
        imdbId: "tt1375666",
        director: new Types.ObjectId(directorId),
      });
    });

    // it("should handle null or undefined entity", () => {
    //   // Act & Assert
    //   expect(MongoMovieMapper.toDocument(null)).toBeNull();
    //   expect(MongoMovieMapper.toDocument(undefined)).toBeNull();
    // });
  });
});
