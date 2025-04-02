import { Response } from "express";
import { ValidationException } from "../../../../../src/infrastructure/exception";
import { HttpResponse } from "../../../../../src/interfaces/http/response";
import { mockHttpResponse } from "../../../../jest-setup";

describe("HttpResponse", () => {
  // Mock response
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  describe("ok", () => {
    it("should return 200 status with data", () => {
      const data = { id: 1, name: "Test" };

      mockHttpResponse.ok.mockImplementation((res, data) => {
        res.status(200).json(data);
      });

      // Act
      HttpResponse.ok(mockResponse, data);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(data);
    });
  });

  describe("created", () => {
    it("should return 201 status with data", () => {
      // Arrange
      const data = { id: 1, name: "Test" };
      mockHttpResponse.created.mockImplementation((res, data) => {
        res.status(201).json(data);
      });

      // Act
      HttpResponse.created(mockResponse, data);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(data);
    });
  });

  describe("noContent", () => {
    it("should return 204 status with no content", () => {
      mockHttpResponse.noContent.mockImplementation((res) => {
        res.status(204).send();
      });

      HttpResponse.noContent(mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalledWith();
    });
  });

  describe("badRequest", () => {
    it("should return 400 status with error message", () => {
      const message = "Bad request message";
      mockHttpResponse.badRequest.mockImplementation((res, message) => {
        res.status(400).json({
          statusCode: 400,
          message,
          error: "Bad Request",
        });
      });

      // Act
      HttpResponse.badRequest(mockResponse, message);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        message,
        error: "Bad Request",
      });
    });
  });

  describe("notFound", () => {
    it("should return 404 status with error message", () => {
      const message = "Not found message";
      mockHttpResponse.notFound.mockImplementation((res, message) => {
        res.status(404).json({
          statusCode: 404,
          message,
          error: "Not Found",
        });
      });

      // Act
      HttpResponse.notFound(mockResponse, message);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 404,
        message,
        error: "Not Found",
      });
    });

    it("should use default message when none provided", () => {
      mockHttpResponse.notFound.mockImplementation((res) => {
        res.status(404).json({
          statusCode: 404,
          message: "Not found",
          error: "Not Found",
        });
      });

      HttpResponse.notFound(mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: "Not found",
        error: "Not Found",
      });
    });
  });

  describe("internalServerError", () => {
    it("should return 500 status with error message", () => {
      mockHttpResponse.notFound.mockImplementation((res) => {
        res.status(500).json({
          statusCode: 500,
          message: "Internal server error",
          error: "Internal Server Error",
        });
      });

      const message = "Internal server error";

      // Act
      HttpResponse.internalServerError(mockResponse, message);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        message,
      });
    });

    it("should use default message when none provided", () => {
      mockHttpResponse.notFound.mockImplementation((res) => {
        res.status(500).json({
          statusCode: 500,
          message: "Something went wrong!",
          error: "Internal Server Error",
        });
      });

      HttpResponse.internalServerError(mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: "Something went wrong!",
        error: "Internal Server Error",
      });
    });
  });

  describe("handleError", () => {
    it("should handle ValidationException with 400 status", () => {
      // Arrange
      const validationErrors = [
        {
          property: "title",
          constraints: { isNotEmpty: "Title should not be empty" },
        },
      ];
      const validationException = new ValidationException(
        validationErrors as any
      );

      // Act
      HttpResponse.handleError(mockResponse, validationException);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Validation failed",
        errors: validationErrors,
      });
    });

    it("should handle generic error with 500 status", () => {
      // Arrange
      const error = new Error("Something went wrong");

      // Act
      HttpResponse.handleError(mockResponse, error);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: "Something went wrong",
      });
    });
  });
});
