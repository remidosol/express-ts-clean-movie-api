import { Request, Response } from "express";
import {
  CreateDirectorUseCase,
  DeleteDirectorUseCase,
} from "../../../../../src/application/use-cases/director";
import { Logger } from "../../../../../src/infrastructure/logger/Logger";
import { NotFoundExceptionMessages } from "../../../../../src/interfaces/constants/exception-messages";
import { DirectorController } from "../../../../../src/interfaces/http/controllers/DirectorController";
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

describe("DirectorController", () => {
  let mockLogger: any;
  let mockCreateDirectorUseCase: any;
  let mockDeleteDirectorUseCase: any;
  let controller: DirectorController;

  beforeEach(() => {
    // Resolve mocks from container
    mockLogger = container.resolve<Logger>(Logger);
    mockCreateDirectorUseCase = container.resolve<CreateDirectorUseCase>(
      CreateDirectorUseCase.name
    );
    mockDeleteDirectorUseCase = container.resolve<DeleteDirectorUseCase>(
      DeleteDirectorUseCase.name
    );

    // Create controller with resolved dependencies
    controller = new DirectorController(
      mockLogger,
      mockCreateDirectorUseCase,
      mockDeleteDirectorUseCase
    );
  });

  describe("createDirector", () => {
    it("should create a director successfully", async () => {
      // Arrange
      const req = {
        body: {
          firstName: "Christopher",
          secondName: "Nolan",
          birthDate: new Date("1970-07-30"),
          bio: "Film director",
        },
      } as Request;

      const res = {} as Response;
      const directorResult = {
        id: "123",
        firstName: "Christopher",
        secondName: "Nolan",
      };

      mockCreateDirectorUseCase.execute.mockResolvedValue(directorResult);

      // Act
      await controller.createDirector(req, res);

      // Assert
      expect(mockCreateDirectorUseCase.execute).toHaveBeenCalledWith(req.body);
      expect(HttpResponse.created).toHaveBeenCalledWith(res, directorResult);
    });

    it("should handle errors", async () => {
      // Arrange
      const req = {
        body: {
          firstName: "Christopher",
        },
      } as Request;

      const res = {} as Response;
      const error = new Error("Test error");

      mockCreateDirectorUseCase.execute.mockRejectedValue(error);

      // Act
      await controller.createDirector(req, res);

      // Assert
      expect(HttpResponse.handleError).toHaveBeenCalledWith(res, error);
    });
  });

  describe("deleteDirector", () => {
    it("should delete a director successfully", async () => {
      // Arrange
      const req = {
        params: { id: "123" },
      } as unknown as Request;

      const res = {} as Response;

      mockDeleteDirectorUseCase.execute.mockResolvedValue(true);

      // Act
      await controller.deleteDirector(req, res);

      // Assert
      expect(mockDeleteDirectorUseCase.execute).toHaveBeenCalledWith("123");
      expect(HttpResponse.noContent).toHaveBeenCalledWith(res);
    });

    it("should return not found when director doesn't exist", async () => {
      // Arrange
      const req = {
        params: { id: "123" },
      } as unknown as Request;

      const res = {} as Response;

      mockDeleteDirectorUseCase.execute.mockResolvedValue(false);

      // Act
      await controller.deleteDirector(req, res);

      // Assert
      expect(HttpResponse.notFound).toHaveBeenCalledWith(
        res,
        NotFoundExceptionMessages.DIRECTOR_NOT_FOUND
      );
    });
  });
});
