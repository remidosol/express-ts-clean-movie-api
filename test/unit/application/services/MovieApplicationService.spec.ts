import { MovieApplicationService } from "../../../../src/application/services/MovieApplicationService";
import { DirectorRepository } from "../../../../src/domain/repositories/DirectorRepository";
import { LOGGER, Logger } from "../../../../src/infrastructure/logger/Logger";
import { container } from "../../../jest-setup";

describe("MovieApplicationService", () => {
  let mockLogger: any;
  let mockDirectorRepository: any;
  let service: MovieApplicationService;

  beforeEach(() => {
    // Resolve mocks from container
    mockLogger = container.resolve<Logger>(LOGGER);
    mockDirectorRepository =
      container.resolve<DirectorRepository>("DirectorRepository");

    // Create service with resolved dependencies
    service = new MovieApplicationService(mockLogger, mockDirectorRepository);
  });

  describe("directorExists", () => {
    it("should return true when director exists", async () => {
      // Arrange
      const directorId = "507f1f77bcf86cd799439011";
      mockDirectorRepository.findById.mockResolvedValue({
        id: "507f1f77bcf86cd799439011",
      });

      // Act
      const result = await service.directorExists(directorId);

      // Assert
      expect(mockDirectorRepository.findById).toHaveBeenCalledWith(directorId);
      expect(result).toBe(true);
    });

    it("should return false when director does not exist", async () => {
      // Arrange
      const directorId = "507f1f77bcf86cd799439011";
      mockDirectorRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.directorExists(directorId);

      // Assert
      expect(mockDirectorRepository.findById).toHaveBeenCalledWith(directorId);
      expect(result).toBe(false);
    });
  });
});
