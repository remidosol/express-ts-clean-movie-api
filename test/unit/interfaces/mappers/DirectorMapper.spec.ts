import { CreateDirectorDto } from "../../../../src/interfaces/dtos/request/director";
import { DirectorMapper } from "../../../../src/interfaces/mappers";
import { createMockDirector } from "../../../jest-setup";

describe("DirectorMapper", () => {
  describe("toDirectorDto", () => {
    it("should map a Director entity to DirectorDto", () => {
      // Arrange
      const now = new Date();

      // Use helper from jest-setup to create a director
      const director = createMockDirector({
        id: "123",
        firstName: "Christopher",
        secondName: "Nolan",
        birthDate: now,
        bio: "Film director",
        createdAt: now,
        updatedAt: now,
      });

      // Act
      const result = DirectorMapper.toDirectorDto(director);

      // Assert
      expect(result).toEqual({
        id: "123",
        firstName: "Christopher",
        secondName: "Nolan",
        birthDate: now,
        bio: "Film director",
        createdAt: now,
        updatedAt: now,
      });
    });
  });

  describe("fromCreateDto", () => {
    it("should map CreateDirectorDto to Director entity", () => {
      // Arrange
      const now = new Date();

      const createDto: CreateDirectorDto = {
        firstName: "Christopher",
        secondName: "Nolan",
        birthDate: now,
        bio: "Film director",
      };

      // Act
      const result = DirectorMapper.fromCreateDto(createDto);

      // Assert
      expect(result).toEqual({
        firstName: "Christopher",
        secondName: "Nolan",
        birthDate: now,
        bio: "Film director",
      });
    });
  });

  describe("toCreateDirectorResponseDto", () => {
    it("should map DirectorDto to CreateDirectorResponseDto", () => {
      // Arrange
      const now = new Date();
      const directorDto = {
        id: "123",
        firstName: "Christopher",
        secondName: "Nolan",
        birthDate: now,
        bio: "Film director",
        createdAt: now,
        updatedAt: now,
      };

      // Act
      const result = DirectorMapper.toCreateDirectorResponseDto(directorDto);

      // Assert
      expect(result.data).toEqual(directorDto);
    });
  });
});
