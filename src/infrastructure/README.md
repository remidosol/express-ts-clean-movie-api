# Infrastructure Layer

The Infrastructure Layer provides concrete implementations of interfaces defined in the domain layer and all the technical capabilities needed by the application. It's the outward-facing technical foundation that supports the inner layers of our Clean Architecture.

## Table of Contents

- [Overview](#overview)
- [Structure](#structure)
- [Configuration](#configuration)
- [Caching](#caching)
- [Dependency Injection](#dependency-injection)
- [Logger](#logger)
- [Repositories](#repositories)
- [Persistence](#persistence)
- [Mappers](#mappers)
- [Swagger](#swagger)
- [Exception Handling](#exception-handling)
- [Design Principles](#design-principles)

## Overview

The Infrastructure Layer is responsible for:

- Implementing data access through concrete repository classes
- Managing configuration and environment variables
- Providing caching mechanisms
- Setting up dependency injection
- Managing database connections and schemas
- Implementing logging services
- Converting between domain entities and database models

This layer is "pluggable" - implementations can be swapped without affecting the core business logic.

## Structure

```
infrastructure/
├── cache/                  # Caching implementation
│   ├── cache.ts            # Cache service using Keyv with Redis/memory fallback
│   └── index.ts            # Export barrel
│
├── config/                 # Application configuration
│   ├── Config.ts           # Main config service
│   ├── EnvironmentVariables.ts # Environment variable definitions
│   └── index.ts            # Export barrel
│
├── di/                     # Dependency injection
│   └── container/          # TSyringe container setup
│       └── index.ts        # IoC container configuration
│
├── exception/              # Custom exceptions
│   └── validationException.ts # Validation error handling
│
├── logger/                 # Logging infrastructure
│   ├── AbstractLogger.ts   # Base abstract logger class
│   ├── Logger.ts           # Main logger implementation
│   ├── types/              # Logger type definitions
│   │   ├── loggerTypes.ts  # Log level and data structure definitions
│   │   └── index.ts        # Export barrel
│   └── winston/            # Winston logger implementation
│       ├── consoleTransport.ts # Console output formatting
│       └── winstonLogger.ts   # Winston logger setup
│
├── mappers/                # ORM to entity mappers
│   ├── MongoDirectorMapper.ts # Maps MongoDB documents to Director entities
│   ├── MongoMovieMapper.ts    # Maps MongoDB documents to Movie entities
│   └── index.ts            # Export barrel
│
├── repositories/           # Repository implementations
│   ├── MongoDirectorRespository.ts # MongoDB implementation of DirectorRepository
│   ├── MongoMovieRepository.ts # MongoDB implementation of MovieRepository
│   └── index.ts            # Export barrel
│
├── swagger/                # Swagger documentation
│   ├── SwaggerDocs.ts      # Swagger UI setup and configuration
│   ├── SwaggerSchemaGenerator.ts # Schema generation from TypeScript DTOs
│   └── index.ts            # Export barrel
│
└── persistence/            # Database schemas and models
    └── schemas/            # Mongoose schema definitions
        ├── DirectorSchema.ts # Director schema definition
        ├── MovieSchema.ts    # Movie schema definition
        └── index.ts        # Export barrel
```

## Configuration

The configuration system provides type-safe access to environment variables with validation.

### Key Components

- **Config**: Singleton service that validates and provides access to environment variables
- **EnvironmentVariables**: Class defining and validating environment variable structure

### Usage

```typescript
// Accessing configuration
@inject(CONFIG) private readonly config: Config

// Get a value (returns undefined if not found)
const port = this.config.get("PORT");

// Get a value (throws error if not found)
const appName = this.config.getOrThrow("APP_NAME");
```

### Implementation Highlights

The configuration system uses class-validator to ensure all required environment variables are present and correctly typed:

```typescript
export class EnvironmentVariables {
  @IsString()
  HOST!: string;

  @IsString()
  PORT!: string;

  @IsEnum(Environment)
  NODE_ENV!: Environment;
  
  // ...more properties
}
```

## Caching

The caching service provides a flexible caching solution with Redis support and in-memory fallback.

### Key Components

- **Cache**: Main cache service that uses Keyv with either Redis or in-memory storage
- **KeyvRedis**: Redis adapter for Keyv when Redis is available

### Usage

```typescript
// Injecting the cache service
@inject(CACHE) private readonly cache: Cache

// Using the cache
const store = this.cache.getStore();
await store.set('key', 'value', ttl);  // ttl in ms
const value = await store.get('key');
```

### Implementation Highlights

- **Automatic Redis Detection**: Uses Redis if credentials are available, falls back to memory cache
- **Namespace Support**: Isolates cache entries by application
- **TTL Management**: Configurable time-to-live for cache entries

## Dependency Injection

The project uses TSyringe for dependency injection, which is configured in the `di/container` folder.

### Key Components

- **Container**: TSyringe container that registers all dependencies
- **Registration**: Registration of services, repositories, use cases, and controllers

### Implementation Highlights

```typescript
// Registration examples
container.registerSingleton<WinstonLogger>(LOGGER_BASE, WinstonLogger);
container.register<Logger>(LOGGER, Logger, { lifecycle: Lifecycle.Transient });

// Repository registration
container.registerSingleton<MovieRepository>(
  "MovieRepository",
  MongoMovieRepository
);

// Use case registration
container.registerSingleton<CreateMovieUseCase>(
  CreateMovieUseCase.name,
  CreateMovieUseCase
);

// Controller registration
container.registerSingleton<MovieController>(
  MovieController.name,
  MovieController
);
```

## Logger

The logging system provides structured, level-based logging with context support.

### Key Components

- **Logger**: Main transient logger service that's injected throughout the application
- **WinstonLogger**: Concrete implementation using Winston
- **AbstractLogger**: Base abstract class defining logger interface
- **ConsoleTransport**: Formatted console output for logs

### Usage

```typescript
// Inject the logger
@inject(LOGGER) private readonly logger: Logger

// Set context (typically in constructor)
this.logger.setOrganizationAndContext(MyClass.name);

// Log at different levels
this.logger.info("Operation successful", { props: { data } });
this.logger.error("Operation failed", { error, props: { id } });
```

### Implementation Highlights

- **Colorized Output**: Different colors for different log levels
- **Structured Format**: JSON-structured logs with consistent format
- **Context Support**: Logs include class/component context
- **Error Capturing**: Special handling for error objects and stacks
- **Correlation IDs**: Support for request correlation IDs

## Repositories

The repositories implement the interfaces defined in the domain layer, providing concrete data access.

### Key Components

- **MongoMovieRepository**: MongoDB implementation of MovieRepository interface
- **MongoDirectorRepository**: MongoDB implementation of DirectorRepository interface

### Implementation Highlights

**MongoMovieRepository:**

```typescript
@injectable()
@singleton()
export class MongoMovieRepository implements MovieRepository {
  // Repository operations:
  async findById(id: string): Promise<Movie | null> { /*...*/ }
  async findAll(options): Promise<Movie[]> { /*...*/ }
  async create(movie: Partial<Movie>): Promise<Movie> { /*...*/ }
  async update(id: string, movie: Partial<Movie>): Promise<Movie | null> { /*...*/ }
  async delete(id: string): Promise<boolean> { /*...*/ }
  async getCount(filters?: Partial<Movie>): Promise<number> { /*...*/ }
  async findByDirector(directorId: string): Promise<Movie[]> { /*...*/ }
}
```

## Persistence

The persistence folder contains Mongoose schemas defining the structure of database documents.

### Key Components

- **MovieSchema**: Mongoose schema for movies collection
- **DirectorSchema**: Mongoose schema for directors collection

### Implementation Highlights

**MovieSchema:**

```typescript
const MovieSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Other fields...
    director: {
      type: Types.ObjectId,
      ref: "Director",
      required: true,
    },
  },
  {
    ...commonSchemaOptions,
    collection: "movies",
  }
);
```

## Mappers

Mappers translate between domain entities and database models/documents.

### Key Components

- **MongoMovieMapper**: Maps between Movie entity and MongoDB document
- **MongoDirectorMapper**: Maps between Director entity and MongoDB document

### Implementation Highlights

**MongoMovieMapper:**

```typescript
export class MongoMovieMapper {
  // Convert MongoDB document to domain entity
  static toEntity(document: any): Movie { /*...*/ }
  
  // Convert domain entity to MongoDB document
  static toDocument(movie: Partial<Movie>): any { /*...*/ }
}
```

## Swagger

The Swagger module provides automatic API documentation generation with OpenAPI specifications.

### Key Components

- **SwaggerDocs**: Main service that configures and sets up Swagger UI
- **SwaggerSchemaGenerator**: Generates OpenAPI schemas from TypeScript DTOs

### Structure

```
swagger/
├── SwaggerDocs.ts          # Swagger UI setup and configuration
├── SwaggerSchemaGenerator.ts # Schema generation from TypeScript DTOs
└── index.ts                # Export barrel
```

### Usage

```typescript
// In your Express app setup
@inject(SwaggerDocs) private readonly swaggerDocs: SwaggerDocs

// Initialize Swagger
this.swaggerDocs.setup(app);
```

### Implementation Highlights

**SwaggerDocs:**

The SwaggerDocs class configures and initializes the Swagger UI:

```typescript
// Setting up Swagger with automatic schema generation
const generatedSchemas = this.schemaGenerator.generateSchemas();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: `${appName} Documentation`,
      version: "1.0.0",
      // ...
    },
    components: {
      schemas: {
        ...generatedSchemas,
        // Additional schemas
      },
    },
  },
  apis: ["./src/interfaces/http/controllers/*.ts"],
};

// Mount Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

**SwaggerSchemaGenerator:**

The SwaggerSchemaGenerator automatically creates OpenAPI schemas from TypeScript DTOs:

- Uses typescript-json-schema to generate JSON schema definitions
- Finds all DTO classes in the project
- Creates type-safe API documentation that stays in sync with your code
- Supports annotations for examples and descriptions

**Benefits:**

- **Automatic Documentation**: API documentation stays in sync with your code
- **Type Safety**: Generated from TypeScript types for accuracy
- **Developer Experience**: Interactive API documentation via Swagger UI
- **Client Integration**: Generated specs can be used to create API clients

## Exception Handling

The exception handling provides custom exceptions and error handling utilities.

### Key Components

- **ValidationException**: Custom exception for validation errors

## Design Principles

The Infrastructure Layer follows these key principles:

1. **Dependency Inversion**: Implements interfaces defined in the domain layer
2. **Separation of Concerns**: Each component has a single responsibility
3. **Configurability**: Services can be configured through environment variables
4. **Injectability**: All services can be injected using TSyringe
5. **Adaptability**: Implementation details can be changed without affecting business logic
6. **Resilience**: Fallback mechanisms for external dependencies (e.g., cache)
