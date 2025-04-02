import { CreateDirectorUseCase } from "../../../../../src/application/use-cases/director/CreateDirectorUseCase";
import { DirectorRepository } from "../../../../../src/domain/repositories/DirectorRepository";
import {
  LOGGER,
  Logger,
} from "../../../../../src/infrastructure/logger/Logger";
import { container } from "../../../../jest-setup";

describe("CreateDirectorUseCase", () => {
  let mockLogger: any;
  let mockDirectorRepository: any;
  let createDirectorUseCase: CreateDirectorUseCase;

  beforeEach(() => {
    // Resolve mocks from container
    mockLogger = container.resolve<Logger>(LOGGER);
    mockDirectorRepository =
      container.resolve<DirectorRepository>("DirectorRepository");

    // Create use case with resolved dependencies
    createDirectorUseCase = new CreateDirectorUseCase(
      mockLogger,
      mockDirectorRepository
    );
  });

  it("should create a director successfully", async () => {
    // Arrange
    const directorData = {
      firstName: "Christopher",
      secondName: "Nolan",
      birthDate: new Date("1970-07-30"),
      bio: "An English film director, producer, and screenwriter",
    };

    const createdDirector = {
      ...directorData,
      id: "123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockDirectorRepository.create.mockResolvedValue(createdDirector);

    // Act
    const result = await createDirectorUseCase.execute(directorData as any);

    // Assert
    expect(mockDirectorRepository.create).toHaveBeenCalledWith(directorData);
    expect(result).toBeDefined();
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Creating new director",
      expect.any(Object)
    );
  });

  it("should throw error when repository throws", async () => {
    // Arrange
    const directorData = {
      firstName: "Christopher",
      secondName: "Nolan",
      birthDate: new Date("1970-07-30"),
      bio: "An English film director, producer, and screenwriter",
    };

    const error = new Error("Database error");
    mockDirectorRepository.create.mockRejectedValue(error);

    // Act & Assert
    await expect(
      createDirectorUseCase.execute(directorData as any)
    ).rejects.toThrow(error);
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Failed to create director",
      expect.any(Object)
    );
  });
});
