# Shared Module

The Shared Module contains cross-cutting utilities and helpers used throughout the application. These utilities are designed to be domain-agnostic and can be used across all architectural layers.

## Table of Contents

- [Overview](#overview)
- [Structure](#structure)
- [Utilities](#utilities)
  - [Route Builder](#route-builder)
  - [MongoDB Utilities](#mongodb-utilities)
  - [Object Sanitization](#object-sanitization)
- [Integration with Other Layers](#integration-with-other-layers)

## Overview

The Shared Module provides common functionality that doesn't directly relate to the domain but is necessary for application implementation. These utilities help with:

- Streamlining API route creation and request validation
- Configuring MongoDB schema options
- Protecting against XSS attacks

These tools enforce consistency, improve security, and reduce code duplication across the application.

## Structure

```
shared/
└── utils/             # Utility functions
    ├── routeBuilder.ts   # Express router creation utility
    ├── mongoUtils.ts     # MongoDB/Mongoose utilities
    ├── sanitizeObject.ts # XSS protection utility
    └── index.ts          # Export barrel
```

## Utilities

### Route Builder

The `routeBuilder` utility is a powerful abstraction over Express routing that provides:

1. **Simplified Route Definition**: Creates Express routes with a cleaner, more declarative syntax
2. **Auto-validation**: Automatically validates request parameters using class-validator
3. **Response Transformation**: Transforms responses using class-transformer
4. **Middleware Integration**: Simplifies adding middleware to routes

#### Key Components

```typescript
export function createRouter() {
  const router = Router();

  const addRoute = (config: RouteConfig) => {
    // Process validation and transformation options
    // ...
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

#### RouteConfig Interface

The `RouteConfig` interface defines the structure for route configurations:

```typescript
interface RouteConfig {
  method: HttpMethod;              // HTTP method (get, post, etc.)
  path: string;                    // Route path
  bodyValidation?: any;            // Class for body validation
  queryValidation?: any;           // Class for query param validation
  paramsValidation?: any;          // Class for route params validation
  handlers: RequestHandler[];      // Route handler functions
  transform?: boolean;             // Whether to transform response
}
```

#### In-depth Mechanics

Under the hood, the route builder:

1. **Request Validation**:
   - Uses `validationMiddleware` to validate request data against DTO classes
   - Supports validating route parameters, query strings, and request bodies
   - Automatically transforms raw request data into typed objects
   - Returns 400 responses with detailed validation errors when validation fails

2. **Response Transformation**:
   - Wraps handler functions with response transformation
   - Uses class-transformer's `instanceToPlain` to convert response objects
   - Applies `@Expose()` and `@Exclude()` decorators to control response format
   - Respects the `excludeExtraneousValues` option for strict property filtering

3. **Handler Execution**:
   - Registers middleware and handlers in the correct order
   - Ensures validation happens before handler execution
   - Preserves Express middleware chain functionality

#### Usage Example

```typescript
// Creating a router
const { router, get, post, delete: del } = createRouter();

// Adding routes with validation
get("/movies", {
  queryValidation: MovieQueryDto,
  handlers: [(req, res) => movieController.getAllMovies(req, res)],
  transform: true,
});

post("/movies", {
  bodyValidation: CreateMovieDto,
  handlers: [(req, res) => movieController.createMovie(req, res)],
  transform: true,
});

del("/movies/:id", {
  paramsValidation: MovieParamsDto,
  handlers: [(req, res) => movieController.deleteMovie(req, res)],
  transform: true,
});

// Export the router for use in the application
export default router;
```

### MongoDB Utilities

The MongoDB utilities provide standardized schema options for Mongoose:

```typescript
export const commonSchemaOptions: SchemaOptions = {
  id: true,
  toJSON: {
    virtuals: true,
    getters: true,
    aliases: false,
    flattenMaps: false,
    transform: (_doc, ret) => {
      // Remove _id field
      if (ret._id) {
        delete ret._id;
      }

      // Ensure id is first in the returned object
      const { id, ...otherProps } = ret;
      return { id, ...otherProps };
    },
  },
  // Additional configuration...
};
```

These options ensure:
- Consistent ID handling (converting MongoDB `_id` to `id`)
- Consistent JSON serialization
- Proper virtual field handling
- Automatic timestamp fields (createdAt, updatedAt)
- Normalized object representation

### Object Sanitization

The `sanitizeObject` utility provides protection against XSS attacks:

```typescript
export const sanitizeObject = <T>(obj: T): T => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  return Object.keys(obj as object).reduce(
    (acc, key) => {
      const value = (obj as any)[key];
      if (typeof value === "string") {
        (acc as any)[key] = xss(value);
      } else if (typeof value === "object" && value !== null) {
        (acc as any)[key] = sanitizeObject(value);
      } else {
        (acc as any)[key] = value;
      }
      return acc;
    },
    Array.isArray(obj) ? [] : {}
  ) as T;
};
```

Key features:
- Recursively processes nested objects and arrays
- Applies XSS filtering to all string values
- Preserves original object structure and types
- Used in middleware to sanitize incoming requests

## Integration with Other Layers

The Shared Module is used across all architectural layers:

- **Interfaces Layer**: Uses routeBuilder for API endpoints and sanitizeObject for request processing
- **Infrastructure Layer**: Uses mongoUtils for database schema definitions
- **Application Layer**: May use sanitization utilities for data processing
- **Main Module**: Uses these utilities during application setup

Being domain-agnostic, these utilities focus on technical concerns rather than business rules, making them suitable for use throughout the application without creating problematic dependencies.
