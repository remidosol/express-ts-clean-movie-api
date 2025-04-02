import { Types } from "mongoose";
import { FindAllMovieOptions } from "../../../../src/domain/repositories";
import { LOGGER, Logger } from "../../../../src/infrastructure/logger/Logger";
import { MongoMovieRepository } from "../../../../src/infrastructure/repositories";
import {
  container,
  mockMongoMovieMapper as MongoMovieMapper,
} from "../../../jest-setup";

describe("MongoMovieRepository", () => {
  let mockLogger: any;
  let MockMovieModel: any;
  let repository: MongoMovieRepository;

  beforeEach(() => {
    jest.clearAllMocks();

    // Resolve mocks from container
    mockLogger = container.resolve<Logger>(LOGGER);
    MockMovieModel = container.resolve("MovieModel");

    // Create repository with resolved dependencies
    repository = new MongoMovieRepository(mockLogger, MockMovieModel);
  });

  describe("create", () => {
    it("should create a new movie", async () => {
      const movieData = {
        title: "Inception",
        director: "507f1f77bcf86cd799439011",
      };

      const documentData = {
        title: "Inception",
        director: new Types.ObjectId("507f1f77bcf86cd799439011"),
      };

      const savedDocument = {
        _id: new Types.ObjectId(),
        ...documentData,
      };

      const expectedEntity = {
        id: savedDocument._id.toString(),
        title: "Inception",
        director: "507f1f77bcf86cd799439011",
      };

      MongoMovieMapper.toDocument.mockReturnValue(documentData);
      MockMovieModel.create.mockResolvedValue(savedDocument);
      MongoMovieMapper.toEntity.mockReturnValue(expectedEntity);

      // Act
      const result = await repository.create(movieData as any);

      // Assert
      expect(MongoMovieMapper.toDocument).toHaveBeenCalledWith(movieData);
      expect(MockMovieModel.create).toHaveBeenCalledWith(documentData);
      expect(MongoMovieMapper.toEntity).toHaveBeenCalledWith(savedDocument);
      expect(result).toEqual(expectedEntity);
    });
  });

  describe("findById", () => {
    it("should find movie by id", async () => {
      const id = "507f1f77bcf86cd799439011";
      const document = {
        _id: new Types.ObjectId(id),
        title: "Inception",
      };
      const expectedEntity = {
        id,
        title: "Inception",
      };

      MockMovieModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(document),
      });
      MongoMovieMapper.toEntity.mockReturnValue(expectedEntity);

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(MockMovieModel.findById).toHaveBeenCalledWith(
        new Types.ObjectId(id)
      );
      expect(MongoMovieMapper.toEntity).toHaveBeenCalledWith(document);
      expect(result).toEqual(expectedEntity);
    });

    it("should return null when movie not found", async () => {
      const id = "507f1f77bcf86cd799439011";

      MockMovieModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should find all movies with default options", async () => {
      const documents = [
        { _id: new Types.ObjectId(), title: "Inception" },
        { _id: new Types.ObjectId(), title: "Interstellar" },
      ];
      const expectedEntities = [
        { id: documents[0]._id.toString(), title: "Inception" },
        { id: documents[1]._id.toString(), title: "Interstellar" },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(documents),
      };

      MockMovieModel.find.mockReturnValue(mockQuery);
      MongoMovieMapper.toEntity
        .mockReturnValueOnce(expectedEntities[0])
        .mockReturnValueOnce(expectedEntities[1]);

      // Act
      const result = await repository.findAll({});

      // Assert
      expect(MockMovieModel.find).toHaveBeenCalledWith({});
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(expectedEntities);
    });

    it("should apply custom pagination, sorting and filtering", async () => {
      const options: FindAllMovieOptions = {
        filters: { genre: "Sci-Fi" },
        pagination: { page: 2, limit: 5 },
        sort: { title: 1 },
        populate: [{ path: "director" }],
      };

      const documents = [{ _id: new Types.ObjectId(), title: "Inception" }];

      const expectedEntities = [
        { id: documents[0]._id.toString(), title: "Inception" },
      ];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(documents),
      };

      MockMovieModel.find.mockReturnValue(mockQuery);
      MongoMovieMapper.toEntity.mockReturnValue(expectedEntities[0]);

      // Act
      const result = await repository.findAll(options);

      // Assert
      expect(MockMovieModel.find).toHaveBeenCalledWith({ genre: "Sci-Fi" });
      expect(mockQuery.skip).toHaveBeenCalledWith(5); // (page - 1) * limit
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(mockQuery.sort).toHaveBeenCalledWith({ title: 1 });
      expect(mockQuery.populate).toHaveBeenCalledWith([{ path: "director" }]);
      expect(result).toEqual(expectedEntities);
    });
  });

  describe("getCount", () => {
    it("should return count of movies matching filters", async () => {
      const filters = { genre: "Sci-Fi" };
      const count = 5;

      MockMovieModel.countDocuments.mockResolvedValue(count);

      // Act
      const result = await repository.getCount(filters);

      // Assert
      expect(MockMovieModel.countDocuments).toHaveBeenCalledWith(filters);
      expect(result).toBe(count);
    });
  });

  describe("update", () => {
    it("should update a movie", async () => {
      const id = "507f1f77bcf86cd799439011";
      const movieData = { title: "Updated Title" };
      const documentData = { title: "Updated Title" };
      const updatedDocument = {
        _id: new Types.ObjectId(id),
        title: "Updated Title",
      };
      const expectedEntity = {
        id,
        title: "Updated Title",
      };

      MongoMovieMapper.toDocument.mockReturnValue(documentData);
      MockMovieModel.findByIdAndUpdate.mockResolvedValue(updatedDocument);
      MongoMovieMapper.toEntity.mockReturnValue(expectedEntity);

      // Act
      const result = await repository.update(id, movieData);

      // Assert
      expect(MongoMovieMapper.toEntity).toHaveBeenCalledWith(movieData);
      expect(MockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: new Types.ObjectId(id) },
        { $set: documentData }
      );
      expect(result).toEqual(expectedEntity);
    });

    it("should return null when movie not found", async () => {
      const id = "507f1f77bcf86cd799439011";
      const movieData = { title: "Updated Title" };
      const documentData = { title: "Updated Title" };

      MongoMovieMapper.toDocument.mockReturnValue(documentData);
      MockMovieModel.findByIdAndUpdate.mockResolvedValue({ modifiedCount: 0 });

      // Act
      const result = await repository.update(id, movieData as any);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a movie", async () => {
      const id = "507f1f77bcf86cd799439011";

      MockMovieModel.findByIdAndDelete.mockResolvedValue({ deletedCount: 1 });

      // Act
      const result = await repository.delete(id);

      // Assert
      expect(MockMovieModel.findByIdAndDelete).toHaveBeenCalledWith(
        new Types.ObjectId(id)
      );
      expect(result).toBe(true);
    });

    it("should return false when movie not found", async () => {
      const id = "507f1f77bcf86cd799439011";

      MockMovieModel.findByIdAndDelete.mockResolvedValue(null);

      // Act
      const result = await repository.delete(id);

      // Assert
      expect(result).toBe(false);
    });
  });
});
