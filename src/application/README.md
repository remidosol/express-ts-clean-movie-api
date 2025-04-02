# Application Layer

The application layer is the heart of business logic in our Clean Architecture implementation. This layer orchestrates the flow of data between the outer interface layer and the inner domain layer, implementing use cases that represent the actual business operations of the system.

## Table of Contents

- [Overview](#overview)
- [Structure](#structure)
- [Use Cases](#use-cases)
  - [Movie Use Cases](#movie-use-cases)
  - [Director Use Cases](#director-use-cases)
- [Services](#services)
- [Design Principles](#design-principles)
- [Integration with Other Layers](#integration-with-other-layers)

## Overview

The application layer serves as the coordination layer that:

- Implements business rules that are specific to the application itself
- Orchestrates the flow of data to and from domain entities
- Interacts with interfaces (like repositories) defined in the domain layer
- Is independent of external frameworks, UI, and database concerns
- Transforms domain entities to DTOs for the interface layer
- Handles validation and business logic before persistence

## Structure

```
application/
├── services/           # Application services
│   ├── MovieApplicationService.ts  # Movie-related application services
│   └── index.ts        # Export barrel
└── use-cases/          # Business use cases
    ├── director/       # Director-related use cases
    │   ├── CreateDirectorUseCase.ts
    │   ├── DeleteDirectorUseCase.ts
    │   └── index.ts    # Export barrel
    └── movie/          # Movie-related use cases
        ├── CreateMovieUseCase.ts
        ├── DeleteMovieUseCase.ts
        ├── GetAllMoviesUseCase.ts
        ├── GetMovieByIdUseCase.ts
        ├── UpdateMovieUseCase.ts
        └── index.ts    # Export barrel
```

## Use Cases

Use cases implement the business operations of our application. Each use case class focuses on a single operation and follows the Single Responsibility Principle.

### Movie Use Cases

#### CreateMovieUseCase

Responsible for creating new movies in the system.

```typescript
// Usage example
const createMovieUseCase = container.resolve<CreateMovieUseCase>(CreateMovieUseCase);
const movieDto = await createMovieUseCase.execute({
  title: "The Matrix",
  description: "A computer hacker learns about the true nature of reality",
  releaseDate: new Date("1999-03-31"),
  genre: "Sci-Fi",
  rating: 8.7,
  imdbId: "tt0133093",
  director: "60d21b4667d0d8992e610c85"
});
```

#### GetAllMoviesUseCase

Retrieves a paginated list of movies with optional filtering and sorting.

```typescript
// Usage example
const getAllMoviesUseCase = container.resolve<GetAllMoviesUseCase>(GetAllMoviesUseCase);
const movies = await getAllMoviesUseCase.execute({
  page: 1,
  limit: 10,
  sortBy: "releaseDate",
  sortDir: "desc",
  filters: { genre: "Action" }
});
```

#### GetMovieByIdUseCase

Retrieves a single movie by its unique identifier.

#### UpdateMovieUseCase

Updates an existing movie with new data.

#### DeleteMovieUseCase

Removes a movie from the system.

### Director Use Cases

#### CreateDirectorUseCase

Creates a new director in the system.

#### DeleteDirectorUseCase

Removes a director from the system.

## Services

Services in the application layer provide utility functionality to support use cases.

### MovieApplicationService

Provides movie-related helper methods used across multiple use cases:

- `directorExists(directorId)`: Verifies if a director exists before creating/updating movies

## Design Principles

The application layer follows these key principles:

1. **Dependency Inversion**: Use cases depend on abstractions (interfaces) rather than concrete implementations
2. **Single Responsibility**: Each use case handles one specific business operation
3. **Dependency Injection**: Dependencies are injected using TSyringe, making testing easier
4. **No Direct External Dependencies**: The layer doesn't directly depend on UI, database, or frameworks
5. **Rich Domain Model**: The domain entities contain business logic relevant to themselves

## Integration with Other Layers

- **Domain Layer**: The application layer depends on domain entities and repository interfaces
- **Infrastructure Layer**: Provides implementations of the repository interfaces
- **Interfaces Layer**: Consumes the use cases via controllers

```
Interfaces Layer → Application Layer → Domain Layer
                     ↑
Infrastructure Layer ┘
```
