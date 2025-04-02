import { DeleteDirectorUseCase } from "../../../../../src/application/use-cases/director/DeleteDirectorUseCase";
import { DirectorRepository } from "../../../../../src/domain/repositories/DirectorRepository";
import {
  LOGGER,
  Logger,
} from "../../../../../src/infrastructure/logger/Logger";
import { container } from "../../../../jest-setup";

describe("DeleteDirectorUseCase", () => {
  let mockLogger: any;
  let mockDirectorRepository: any;
  let deleteDirectorUseCase: DeleteDirectorUseCase;

  beforeEach(() => {
    // Resolve mocks from container
    mockLogger = container.resolve<Logger>(LOGGER);
    mockDirectorRepository =
      container.resolve<DirectorRepository>("DirectorRepository");

    // Create use case with resolved dependencies
    deleteDirectorUseCase = new DeleteDirectorUseCase(
      mockLogger,
      mockDirectorRepository
    );
  });

  it("should delete a director successfully", async () => {
    // Arrange
    const directorId = "507f1f77bcf86cd799439011";
    mockDirectorRepository.delete.mockResolvedValue(true);

    // Act
    const result = await deleteDirectorUseCase.execute(directorId);

    // Assert
    expect(mockDirectorRepository.delete).toHaveBeenCalledWith(directorId);
    expect(result).toBe(true);
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Deleting director",
      expect.any(Object)
    );
  });

  it("should return false when director does not exist", async () => {
    // Arrange
    const directorId = "507f1f77bcf86cd799439011";
    mockDirectorRepository.delete.mockResolvedValue(false);

    // Act
    const result = await deleteDirectorUseCase.execute(directorId);

    // Assert
    expect(mockDirectorRepository.delete).toHaveBeenCalledWith(directorId);
    expect(result).toBe(false);
  });

  it("should throw error when repository throws", async () => {
    // Arrange
    const directorId = "507f1f77bcf86cd799439011";
    const error = new Error("Database error");
    mockDirectorRepository.delete.mockRejectedValue(error);

    // Act & Assert
    await expect(deleteDirectorUseCase.execute(directorId)).rejects.toThrow(
      error
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Failed to delete director",
      expect.any(Object)
    );
  });
});
