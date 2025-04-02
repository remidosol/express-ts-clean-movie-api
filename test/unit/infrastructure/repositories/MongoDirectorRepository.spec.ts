import { Types } from "mongoose";
import { LOGGER, Logger } from "../../../../src/infrastructure/logger/Logger";
import { MongoDirectorMapper } from "../../../../src/infrastructure/mappers";
import { MongoDirectorRepository } from "../../../../src/infrastructure/repositories";
import { container } from "../../../jest-setup";

// Mock mapper
jest.mock("../../../../src/infrastructure/mappers/MongoDirectorMapper", () => ({
  MongoDirectorMapper: {
    toEntity: jest.fn(),
    toDocument: jest.fn(),
  },
}));

describe("MongoDirectorRepository", () => {
  let mockLogger: any;
  let MockDirectorModel: any;
  let repository: MongoDirectorRepository;

  beforeEach(() => {
    jest.clearAllMocks();

    // Resolve mocks from container
    mockLogger = container.resolve<Logger>(LOGGER);
    MockDirectorModel = container.resolve("DirectorModel");

    // Create repository with resolved dependencies
    repository = new MongoDirectorRepository(mockLogger, MockDirectorModel);
  });

  describe("create", () => {
    it("should create a new director", async () => {
      // Arrange
      const directorData = {
        firstName: "Christopher",
        secondName: "Nolan",
      };

      const documentData = {
        firstName: "Christopher",
        secondName: "Nolan",
      };

      const savedDocument = {
        _id: new Types.ObjectId(),
        ...documentData,
      };

      const expectedEntity = {
        id: savedDocument._id.toString(),
        firstName: "Christopher",
        secondName: "Nolan",
      };

      (MongoDirectorMapper.toDocument as any).mockReturnValue(documentData);
      MockDirectorModel.create.mockResolvedValue(savedDocument);
      (MongoDirectorMapper.toEntity as any).mockReturnValue(expectedEntity);

      // Act
      const result = await repository.create(directorData as any);

      // Assert
      expect(MongoDirectorMapper.toDocument as any).toHaveBeenCalledWith(
        directorData
      );
      expect(MockDirectorModel.create).toHaveBeenCalledWith(documentData);
      expect(MongoDirectorMapper.toEntity as any).toHaveBeenCalledWith(
        savedDocument
      );
      expect(result).toEqual(expectedEntity);
    });
  });

  describe("findById", () => {
    it("should find director by id", async () => {
      // Arrange
      const id = "507f1f77bcf86cd799439011";
      const document = {
        _id: new Types.ObjectId(id),
        firstName: "Christopher",
        secondName: "Nolan",
      };
      const expectedEntity = {
        id,
        firstName: "Christopher",
        secondName: "Nolan",
      };

      MockDirectorModel.findById.mockResolvedValue(document);
      (MongoDirectorMapper.toEntity as any).mockReturnValue(expectedEntity);

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(MockDirectorModel.findById).toHaveBeenCalledWith(
        new Types.ObjectId(id)
      );
      expect(MongoDirectorMapper.toEntity as any).toHaveBeenCalledWith(
        document
      );
      expect(result).toEqual(expectedEntity);
    });

    it("should return null when director not found", async () => {
      // Arrange
      const id = "507f1f77bcf86cd799439011";

      MockDirectorModel.findById.mockResolvedValue(null);

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a director", async () => {
      // Arrange
      const id = "507f1f77bcf86cd799439011";

      MockDirectorModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      // Act
      const result = await repository.delete(id);

      // Assert
      expect(MockDirectorModel.deleteOne).toHaveBeenCalledWith({
        _id: new Types.ObjectId(id),
      });
      expect(result).toBe(true);
    });

    it("should return false when director not found", async () => {
      // Arrange
      const id = "507f1f77bcf86cd799439011";

      MockDirectorModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      // Act
      const result = await repository.delete(id);

      // Assert
      expect(result).toBe(false);
    });
  });
});
