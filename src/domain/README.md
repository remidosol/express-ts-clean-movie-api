# Domain Layer

The Domain Layer represents the core of the application in our Clean Architecture implementation. It contains the business entities, rules, and repository interfaces that define the essence of the business domain, independent of any external concerns.

## Table of Contents

- [Overview](#overview)
- [Structure](#structure)
- [Entities](#entities)
  - [Movie](#movie)
  - [Director](#director)
- [Repository Interfaces](#repository-interfaces)
  - [MovieRepository](#movierepository)
  - [DirectorRepository](#directorrepository)
- [Design Principles](#design-principles)

## Overview

The Domain Layer is the innermost layer of the Clean Architecture pattern and has the following characteristics:

- Contains enterprise-wide business rules and entities
- Has no dependencies on other layers or external frameworks
- Defines interfaces that outer layers must implement
- Represents the most stable part of the application
- Is technology-agnostic and framework-independent
- Embodies the core business knowledge

This layer should remain stable even when:

- User interfaces change
- Database technologies change
- External services are replaced
- Frameworks are updated

## Structure

```
domain/
├── entities/          # Core business objects
│   ├── Director.ts    # Director entity definition
│   ├── Movie.ts       # Movie entity definition
│   └── index.ts       # Export barrel
└── repositories/      # Repository interface definitions
    ├── DirectorRepository.ts
    ├── MovieRepository.ts
    └── index.ts       # Export barrel
```

## Entities

Entities are the core business objects of the system. They encapsulate the most general and high-level business rules and are the least likely to change when something external changes.

### Movie

The `Movie` entity represents a film in our system:

```typescript
export interface Movie {
  id?: string;
  title: string;
  description: string;
  releaseDate: Date;
  genre: string;
  rating?: number;
  imdbId: string;
  director: Types.ObjectId | Director | string;
  createdAt: Date;
  updatedAt: Date;
}
```

Key characteristics:

- **id**: Unique identifier (optional as it's assigned during creation)
- **title**: The movie's title (required)
- **description**: A summary or synopsis of the movie (required)
- **releaseDate**: When the movie was released (required)
- **genre**: The movie's category or genre (required)
- **rating**: Numerical rating of the movie (optional)
- **imdbId**: Reference to the Internet Movie Database ID (required)
- **director**: Reference to the movie's director, supporting different representation formats (required)
- **createdAt/updatedAt**: Timestamps for record keeping

### Director

The `Director` entity represents a film director:

```typescript
export interface Director {
  id?: string;
  firstName: string;
  secondName: string;
  birthDate: Date;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Key characteristics:

- **id**: Unique identifier (optional as it's assigned during creation)
- **firstName**: Director's first name (required)
- **secondName**: Director's last name (required)
- **birthDate**: Director's date of birth (required)
- **bio**: Biographical information about the director (required)
- **createdAt/updatedAt**: Timestamps for record keeping

## Repository Interfaces

Repository interfaces define the contract for data access operations. They abstract the underlying data source, making the domain layer independent of specific database technologies.

### MovieRepository

The `MovieRepository` interface defines operations for movie data:

```typescript
export interface MovieRepository {
  findById(id: string): Promise<Movie | null>;
  findAll(params: FindAllMovieOptions): Promise<Movie[]>;
  getCount(filters?: Partial<Movie>): Promise<number>;
  findByDirector(directorId: string): Promise<Movie[]>;
  create(movie: Partial<Movie>): Promise<Movie>;
  update(id: string, movie: Partial<Movie>): Promise<Movie | null>;
  delete(id: string): Promise<boolean>;
}
```

Key operations:

- **findById**: Retrieve a movie by its unique identifier
- **findAll**: Retrieve movies with filtering, pagination, and sorting options
- **getCount**: Count movies matching specific criteria
- **findByDirector**: Find all movies by a specific director
- **create**: Create a new movie record
- **update**: Update an existing movie
- **delete**: Remove a movie from the system

### DirectorRepository

The `DirectorRepository` interface defines operations for director data:

```typescript
export interface DirectorRepository {
  findById(id: string): Promise<Director | null>;
  create(director: Partial<Director>): Promise<Director>;
  delete(id: string): Promise<boolean>;
}
```

Key operations:

- **findById**: Retrieve a director by their unique identifier
- **create**: Create a new director record
- **delete**: Remove a director from the system

## Design Principles

The Domain Layer follows these key principles:

1. **Entity Independence**: Entities are defined purely based on business requirements, not infrastructure concerns
2. **Separation of Concerns**: Business rules are separated from implementation details
3. **Dependency Rule**: The domain layer depends on nothing; all dependencies point inward toward it
4. **Interface Segregation**: Repository interfaces define only what's needed by the domain
5. **Immutability**: Entities should be treated as immutable to prevent unexpected state changes
6. **Ubiquitous Language**: Terminology in the code reflects the language of the business domain