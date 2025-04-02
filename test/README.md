# Testing Documentation

This directory contains all the tests for the Express TypeScript Clean Architecture Movie API.

## Overview

The tests are organized following the Clean Architecture pattern, mirroring the structure of the main application code. The test suite includes both unit tests for individual components and end-to-end (E2E) tests for API integration.

## Test Structure

```
test/
├── unit/                          # Unit tests for individual components
│   ├── application/               # Tests for application layer
│   │   ├── services/              # Application service tests
│   │   └── use-cases/             # Use case tests
│   │       ├── director/          # Director use case tests
│   │       └── movie/             # Movie use case tests
│   ├── infrastructure/            # Infrastructure layer tests
│   │   ├── mappers/               # Data mapper tests
│   │   └── repositories/          # Repository implementation tests
│   └── interfaces/                # Interface layer tests
│       ├── http/                  # HTTP-related tests
│       │   ├── controllers/       # Controller tests
│       │   └── response/          # HTTP response tests
│       └── mappers/               # DTO mapper tests
├── e2e/                           # End-to-end tests
│   └── api/                       # API endpoint tests
│       ├── director.workflow.spec.ts  # Director API workflow tests
│       └── movie.workflow.spec.ts     # Movie API workflow tests
├── jest-setup.ts                  # Jest configuration and test helpers
└── README.md                      # This documentation file
```

## Testing Configuration

### jest.config.ts

The `jest.config.ts` file at the project root contains the Jest configuration for running tests:

```typescript
// Key configuration settings
{
  preset: "ts-jest",              // Use TypeScript with Jest
  testEnvironment: "node",        // Run tests in Node.js environment
  testMatch: ["**/*.spec.ts"],    // Pattern to find test files (*.spec.ts)
  coverageDirectory: "coverage",  // Output directory for coverage reports
  // ... other settings
}
```

Key configurations include:

- **Test File Pattern**: Tests are identified by the `.spec.ts` extension
- **Coverage Collection**: Code coverage is tracked for the `src/` directory
- **TypeScript Support**: Uses `ts-jest` for TypeScript file transpilation
- **Environment**: Tests run in a Node.js environment

### jest-setup.ts

The `jest-setup.ts` file is the global setup file for all tests. It provides:

1. **Dependency Injection Configuration**: Sets up the test container with mock dependencies
2. **Common Mocks**: Provides mock implementations for:
   - Loggers
   - Configuration
   - Caching services
   - Repositories
   - Data mappers
   - Application services
   - Use cases
   - HTTP responses

3. **Helper Functions**: Includes utilities for creating test data:
   - `createMockMovie()`: Creates mock movie entities with customizable properties
   - `createMockDirector()`: Creates mock director entities with customizable properties

4. **Test Lifecycle Management**:
   - `beforeEach()`: Resets mocks and container before each test
   - `afterAll()`: Cleans up connections after tests complete

This setup enables consistent unit testing by providing controlled mock dependencies that can be used throughout the test suite.

## Running Tests

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (for E2E tests)
- Redis (optional, for caching tests)

### Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run E2E tests only
npm run test:e2e

# Run E2E tests with local configuration
npm run test:e2e:local

# Run tests with coverage
npm run test:coverage
```

## Testing Stack

- Jest - Test runner and assertion library
- Supertest - HTTP testing for E2E tests
- MongoDB - Test database for E2E tests
- Class-validator - Validation testing

## End-to-End (E2E) Testing

### Overview

E2E tests verify that the entire application works correctly from the user's perspective by making real HTTP requests to API endpoints and validating the responses. These tests ensure that:

- All API endpoints function correctly
- Request/response formats match expectations
- Business logic is correctly implemented across the system
- Error handling works as expected

### E2E Test Structure

E2E tests follow a workflow-based approach that simulates real-world usage patterns:

1. **Setup**: Creating necessary test data (e.g., creating a director before testing movie endpoints)
2. **Test Cases**: Testing both successful operations and error cases
3. **Cleanup**: Removing test data after tests complete

### Example E2E Test Flow

For typical API endpoints, the test flow includes:

1. Creating resources and verifying successful creation
2. Retrieving and validating created resources
3. Updating resources and verifying changes
4. Deleting resources and confirming removal
5. Testing error scenarios (invalid inputs, non-existent resources, etc.)

### Movie API Test Example

```typescript
describe("Movie API E2E Tests", () => {
  // Setup test environment and data
  beforeAll(async () => {
    // Initialize app and database connection
    // Create prerequisite data (e.g., a director)
  });

  // Cleanup after tests
  afterAll(async () => {
    // Remove created test data
    // Close database connections
  });

  describe("POST /api/v1/movies", () => {
    it("should create a new movie successfully", async () => {
      // Send request to create movie
      // Validate successful response
      // Store created movie ID for later tests
    });

    it("should reject invalid movie data", async () => {
      // Send request with invalid data
      // Verify appropriate error response
    });
  });

  // Additional test cases for GET, PATCH, DELETE endpoints
  
  describe("Complete Movie Workflow", () => {
    it("should support the entire movie CRUD lifecycle", async () => {
      // Create a movie
      // Retrieve the movie
      // Update the movie
      // Verify updates
      // Delete the movie
      // Verify deletion
    });
  });
});
```

## Unit Testing

Unit tests focus on testing individual components in isolation, using mocks for dependencies. These tests ensure that:

- Individual components work correctly in isolation
- Business logic is properly implemented
- Edge cases are handled appropriately

### Example Unit Test

```typescript
import { CreateMovieUseCase } from "../../../src/application/use-cases/movie/CreateMovieUseCase";

describe("CreateMovieUseCase", () => {
  let mockLogger: any;
  let mockMovieRepository: any;
  let mockMovieApplicationService: any;
  let createMovieUseCase: CreateMovieUseCase;

  beforeEach(() => {
    // Set up mocks and dependencies
    mockLogger = { info: jest.fn(), error: jest.fn() };
    mockMovieRepository = { create: jest.fn() };
    mockMovieApplicationService = { directorExists: jest.fn() };
    
    createMovieUseCase = new CreateMovieUseCase(
      mockLogger,
      mockMovieRepository,
      mockMovieApplicationService
    );
  });
  
  it("should create a movie successfully when director exists", async () => {
    // Arrange
    const directorId = "507f1f77bcf86cd799439011";
    const movieData = {
      title: "Test Movie",
      director: directorId,
      // Other movie properties
    };
    mockMovieApplicationService.directorExists.mockResolvedValue(true);
    mockMovieRepository.create.mockResolvedValue({ id: "123", ...movieData });
    
    // Act
    const result = await createMovieUseCase.execute(movieData);
    
    // Assert
    expect(mockMovieApplicationService.directorExists).toHaveBeenCalledWith(directorId);
    expect(mockMovieRepository.create).toHaveBeenCalledWith(movieData);
    expect(result).toBeDefined();
    expect(result.id).toBe("123");
  });
});
