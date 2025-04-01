# Interfaces Layer

The Interfaces Layer is the outermost layer in our Clean Architecture implementation. It acts as the boundary between the external world and our application core, handling all communication with external systems, users, and services.

## Table of Contents

- [Overview](#overview)
- [Structure](#structure)
- [Constants and Exception Messages](#constants-and-exception-messages)
- [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)
  - [Request DTOs](#request-dtos)
  - [Response DTOs](#response-dtos)
- [HTTP Components](#http-components)
  - [Controllers](#controllers)
  - [Routes](#routes)
  - [Response Handling](#response-handling)
  - [Middleware](#middleware)
- [Validation](#validation)
- [Design Principles](#design-principles)
- [Integration with Other Layers](#integration-with-other-layers)

## Overview

The Interfaces Layer serves as the entry point for our application, with the following responsibilities:

- Receiving HTTP requests and translating them into application layer use case calls
- Converting domain and application data into formats suitable for external consumption
- Handling validation of incoming data
- Managing HTTP status codes, headers, and response formats
- Defining API routes and endpoints
- Implementing middleware for cross-cutting concerns
- Providing error handling and exception translation

This layer is designed to be replaceable and adaptable, allowing our core business logic to remain untouched even if the external interface changes (e.g., from REST to GraphQL or gRPC).

## Structure

```
interfaces/
├── constants/               # Shared constants and messages
│   ├── exception-messages.ts    # HTTP error messages
│   └── validation-messages/     # Domain validation messages
│       ├── director-validation-messages.ts
│       ├── movie-validation-messages.ts
│       └── index.ts
│
├── dtos/                   # Data Transfer Objects
│   ├── request/            # Request DTOs for validating incoming data
│   │   ├── director/       # Director-related request DTOs
│   │   │   ├── CreateDirectorDto.ts
│   │   │   ├── DirectorParamsDto.ts
│   │   │   └── index.ts
│   │   └── movie/          # Movie-related request DTOs
│   │       ├── CreateMovieDto.ts
│   │       ├── MovieParamsDto.ts
│   │       ├── MovieQueryDto.ts
│   │       ├── UpdateMovieDto.ts
│   │       └── index.ts
│   └── response/           # Response DTOs for shaping outgoing data
│       ├── director/       # Director-related response DTOs
│       │   ├── CreateDirectorResponseDto.ts
│       │   ├── DirectorDto.ts
│       │   └── index.ts
│       ├── movie/          # Movie-related response DTOs
│       │   ├── CreateMovieResponseDto.ts
│       │   ├── GetMovieResponseDto.ts
│       │   ├── MovieDto.ts
│       │   ├── MovieListResponseDto.ts
│       │   ├── UpdateMovieResponseDto.ts
│       │   └── index.ts
│       └── PaginationDto.ts # Shared pagination DTO
│
└── http/                   # HTTP-specific components
    ├── controllers/        # Request handlers
    │   ├── DirectorController.ts
    │   ├── MovieController.ts
    │   └── index.ts
    ├── middleware/         # HTTP middleware
    │   ├── errorHandler.ts
    │   ├── validationMiddleware.ts
    │   └── index.ts
    ├── response/           # HTTP response handling
    │   ├── HttpResponse.ts
    │   └── index.ts
    └── routes/             # API route definitions
        ├── directorRouter.ts
        ├── movieRouter.ts
        └── index.ts
```

## Constants and Exception Messages

The `constants` folder contains centralized definitions for error messages and validation requirements, promoting consistency across the API.

### Exception Messages

Exception messages are grouped by their HTTP status code equivalent:

```typescript
// Sample from exception-messages.ts
export const BadRequestExceptionMessages = {
  PROVIDE_ARRAY: "Please provide an array!",
  PROVIDE_STRING: "You should provide a string",
  INVALID_ID: "The id which has been provided is not valid",
  // ...
};

export const NotFoundExceptionMessages = {
  MOVIE_NOT_FOUND: "Movie not found!",
  DIRECTOR_NOT_FOUND: "Director not found!",
};
```

### Validation Messages

Domain-specific validation messages ensure consistent user feedback:

```typescript
// Sample from director-validation-messages.ts
export const DirectorValidationMessages = {
  PROVIDE_ID: "You must provide a director ID",
  PROVIDE_FIRST_NAME: "Director first name is required",
  // ...
};
```

## Data Transfer Objects (DTOs)

DTOs serve as the data contracts between the external world and our application. They separate our internal domain models from the API's representation.

### Request DTOs

Request DTOs validate incoming data and enforce constraints using class-validator decorators:

```typescript
// Sample from CreateMovieDto.ts
export class CreateMovieDto {
  @IsString({ message: BadRequestExceptionMessages.PROVIDE_STRING })
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_TITLE })
  title!: string;

  @IsDate({ message: MovieValidationMessages.INVALID_RELEASE_DATE })
  @Type(() => Date)
  @IsNotEmpty({ message: MovieValidationMessages.PROVIDE_RELEASE_DATE })
  releaseDate!: Date;

  // Other properties...
}
```

### Response DTOs

Response DTOs shape the data returned from our application using class-transformer decorators:

```typescript
// Sample from MovieDto.ts
export class MovieDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  @Type(() => DirectorDto)
  director!: DirectorDto;

  // Other exposed properties...

  @Exclude()
  someInternalProperty!: string; // Not exposed to clients
}
```

## HTTP Components

### Controllers

Controllers handle HTTP requests by orchestrating use case execution and response preparation:

```typescript
@injectable()
@singleton()
export class MovieController {
  constructor(
    @inject(LOGGER) private readonly logger: Logger,
    @inject(CreateMovieUseCase.name) private createMovieUseCase: CreateMovieUseCase,
    // Other use case injections...
  ) {
    logger.setOrganizationAndContext(MovieController.name);
  }

  async createMovie(req: Request, res: Response): Promise<void> {
    try {
      const createMovieDto = req.body as CreateMovieDto;
      const movieParams = MovieMapper.fromCreateDto(createMovieDto);
      const result = await this.createMovieUseCase.execute(movieParams);
      HttpResponse.created(res, result);
    } catch (error: any) {
      this.logger.error("Error creating movie", { error });
      HttpResponse.handleError(res, error);
    }
  }

  // Other controller methods...
}
```

### Routes

Routes define API endpoints and connect them to controller methods. Our project uses a custom `routeBuilder` utility to create routes with built-in validation and response transformation capabilities.

#### Route Builder

The `routeBuilder` utility encapsulates Express routing logic with added features:

```typescript
export function createRouter() {
  const router = Router();

  // Add route method with validation and transformation capabilities
  const addRoute = (config: RouteConfig) => {
    // Configuration for routes including validation and transformation
  };

  return {
    router,
    addRoute,
    get: (path, config) => addRoute({ method: "get", path, ...config }),
    post: (path, config) => addRoute({ method: "post", path, ...config }),
    patch: (path, config) => addRoute({ method: "patch", path, ...config }),
    delete: (path, config) => addRoute({ method: "delete", path, ...config }),
  };
}
```

Benefits of using the route builder:
- **Automatic Validation**: Integrates class-validator for request validation
- **Type Safety**: Enforces type checking for request data
- **Response Transformation**: Automatically applies class-transformer for response formatting
- **Consistent API Structure**: Standardizes route definitions across the application
- **Middleware Integration**: Simplifies adding middleware to routes
- **DRY Principle**: Reduces code duplication in route definitions

#### Router Implementations

The application includes two main routers:

**Movie Router**:
```typescript
export const movieRouter = (movieController: MovieController) => {
  const { router, get, post, patch, delete: del } = createRouter();

  get("/", {
    queryValidation: MovieQueryDto,
    handlers: [(req, res) => movieController.getAllMovies(req, res)],
    transform: true,
  });

  post("/", {
    bodyValidation: CreateMovieDto,
    handlers: [(req, res) => movieController.createMovie(req, res)],
    transform: true,
  });

  // Additional movie routes...

  return router;
};
```

**Director Router**:
```typescript
export const directorRouter = (directorController: DirectorController) => {
  const { router, post, delete: del } = createRouter();

  post("/", {
    bodyValidation: CreateDirectorDto,
    handlers: [(req, res) => directorController.createDirector(req, res)],
    transform: true,
  });

  del("/:id", {
    paramsValidation: DirectorParamsDto,
    handlers: [(req, res) => directorController.deleteDirector(req, res)],
    transform: true,
  });

  return router;
};
```

The routers are registered in the application's main setup:

```typescript
app.use("/api/movies", movieRouter(movieController));
app.use("/api/directors", directorRouter(directorController));
```

### Response Handling

The `HttpResponse` class provides standardized HTTP responses:

```typescript
export class HttpResponse {
  static ok(res: Response, data: any): Response {
    return res.status(200).json(data);
  }

  static created(res: Response, data: any): Response {
    return res.status(201).json(data);
  }

  static notFound(res: Response, message: string = "Not found"): Response {
    return res.status(404).json({
      statusCode: 404,
      message,
    });
  }

  // Other response methods...
}
```

### Middleware

Middleware handles cross-cutting concerns like validation and error handling:

```typescript
// Sample from validationMiddleware.ts
export function validationMiddleware(
  type: any,
  location: "body" | "query" | "params" = "body"
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const source = req[location];
    if (!source) {
      return next();
    }

    const object = plainToInstance(type, source);
    const errors = await validate(object, {
      whitelist: true,
      skipMissingProperties: true,
    });

    if (errors.length > 0) {
      return next(new ValidationException(errors));
    }

    req[location] = object;
    next();
  };
}
```

## Validation

Validation occurs at multiple levels:

1. **Request DTOs**: Using class-validator decorators for type and constraint validation
2. **Middleware**: Transforming and validating incoming requests before they reach controllers
3. **Controllers**: Additional business rule validation before use case execution
4. **Response Transformation**: Using class-transformer to ensure only intended data is exposed

## Design Principles

The Interfaces Layer adheres to these key principles:

1. **Single Responsibility**: Each component handles one aspect of the interface (validation, routing, etc.)
2. **Separation of Concerns**: Controllers focus on HTTP handling, delegating business logic to use cases
3. **Layer Independence**: This layer depends on inner layers but not the other way around
4. **Transparency**: External clients shouldn't need to understand internal implementation details
5. **Consistency**: Standardized response formats and error handling patterns
6. **Type Safety**: Strongly typed DTOs and validation ensure data integrity

## Integration with Other Layers

The Interfaces Layer interacts primarily with the Application Layer:

```
External Client → Interfaces Layer (Controllers, Routes) → Application Layer (Use Cases) → Domain Layer
```

Controllers depend on use cases from the Application Layer, but use cases have no knowledge of controllers or HTTP concepts.