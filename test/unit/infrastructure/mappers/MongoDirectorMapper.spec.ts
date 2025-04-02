import { Types } from "mongoose";
import { MongoDirectorMapper } from "../../../../src/infrastructure/mappers/MongoDirectorMapper";

describe("MongoDirectorMapper", () => {
  describe("toEntity", () => {
    it("should convert MongoDB document to domain entity", () => {
      // Arrange
      const documentId = new Types.ObjectId();
      const now = new Date();

      const document = {
        _id: documentId,
        firstName: "Christopher",
        secondName: "Nolan",
        birthDate: now,
        bio: "A film director",
        createdAt: now,
        updatedAt: now,
      };

      // Act
      const result = MongoDirectorMapper.toEntity(document as any);

      // Assert
      expect(result).toEqual({
        id: documentId.toString(),
        firstName: "Christopher",
        secondName: "Nolan",
        birthDate: now,
        bio: "A film director",
        createdAt: now,
        updatedAt: now,
      });
    });

    it("should handle null or undefined document", () => {
      // Act & Assert
      expect(MongoDirectorMapper.toEntity(null)).toBeNull();
      expect(MongoDirectorMapper.toEntity(undefined)).toBeNull();
    });
  });

  describe("toDocument", () => {
    it("should convert domain entity to MongoDB document", () => {
      // Arrange
      const now = new Date();

      const entity = {
        firstName: "Christopher",
        secondName: "Nolan",
        birthDate: now,
        bio: "A film director",
      };

      // Act
      const result = MongoDirectorMapper.toDocument(entity as any);

      // Assert
      expect(result).toEqual({
        firstName: "Christopher",
        secondName: "Nolan",
        birthDate: now,
        bio: "A film director",
      });
    });

    // it("should handle null or undefined entity", () => {
    //   // Act & Assert
    //   expect(MongoDirectorMapper.toDocument(null)).toBeNull();
    //   expect(MongoDirectorMapper.toDocument(undefined)).toBeNull();
    // });
  });
});
