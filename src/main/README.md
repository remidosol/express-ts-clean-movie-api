# Main Module

The Main module serves as the application entry point and bootstrapping mechanism for our Clean Architecture implementation. This module composes and wires together all architectural layers, enabling the application to start and function as a cohesive system.

## Table of Contents

- [Overview](#overview)
- [Structure](#structure)
- [Bootstrapping Process](#bootstrapping-process)
- [Express Application](#express-application)
- [Middleware Configuration](#middleware-configuration)
- [Route Registration](#route-registration)
- [Integration with Architectural Layers](#integration-with-architectural-layers)

## Overview

The Main module is responsible for:

- Creating and configuring the Express application
- Bootstrapping the entire system
- Setting up middleware
- Registering API routes
- Initializing database connections
- Starting the HTTP server
- Orchestrating the dependency injection container

This module doesn't contain business logic or interface-specific code but focuses solely on composition and initialization of the application's components.

## Structure

```
main/
├── app.ts              # Express application instance
├── bootstrap.ts        # Application bootstrapping logic
├── middleware.ts       # Middleware configuration
├── routes.ts           # Route registration
└── README.md           # Documentation (this file)
```

## Bootstrapping Process

The bootstrapping process is defined in `bootstrap.ts` and follows these steps:

1. Initialize environment variables
2. Set up the dependency injection container
3. Configure Express middleware
4. Register API routes
5. Establish database connections
6. Start the application

```typescript
export async function bootstrap(app: Express): Promise<void> {
  try {
    // Initialize configuration
    const config = container.resolve<Config>(CONFIG);
    const logger = container.resolve<Logger>(LOGGER);
    logger.setOrganizationAndContext("Bootstrap");

    // Configure middleware
    setupMiddleware(app);

    // Register all routes
    registerRoutes(app);

    // Initialize database connections
    await mongoose.connect(config.getOrThrow("DATABASE_URL"));
    logger.info("MongoDB connected successfully");

    logger.info("Application bootstrapped successfully");
  } catch (error: any) {
    // Error handling...
  }
}
```

## Express Application

The Express application instance is created in `app.ts`:

```typescript
import express from "express";

const app = express();

export { app };
```

This instance is then imported by `server.ts` (in the project root) which calls the bootstrap function and starts listening on the configured port.

## Middleware Configuration

Middleware is set up in `middleware.ts` and provides essential capabilities:

- JSON body parsing
- Security headers via Helmet
- CORS configuration
- XSS protection
- Response time tracking
- Class validator container integration
- Class transformer response processing
- Global error handling

Key middleware features include:

```typescript
export function setupMiddleware(app: Express): void {
  // Basic middleware
  app.use(express.json({ limit: "15mb" }));
  app.use(helmet());
  app.use(cors());

  // XSS protection
  app.use((req, _res, next) => {
    if (req.body) req.body = sanitizeObject(req.body);
    // ...sanitize other parts of the request
    next();
  });

  // Class transformer for response formatting
  app.use((_req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      return originalJson.call(
        this,
        data && typeof data === "object"
          ? instanceToPlain(data, transformOptions)
          : data
      );
    };
    next();
  });

  // Error handling middleware
  app.use(errorHandlerMiddleware);
}
```

## Route Registration

Routes are registered in `routes.ts`, which connects controllers to Express routes:

```typescript
export function registerRoutes(app: Express): Promise<void> {
  const movieController = container.resolve<MovieController>(MovieController);
  const directorController = container.resolve<DirectorController>(DirectorController);

  // Define API routes
  app.use("/api/movies", movieRouter(movieController));
  app.use("/api/directors", directorRouter(directorController));
}
```

The registration process:

1. Resolves controllers from the dependency injection container
2. Creates routers using the controller instances
3. Mounts the routers at their respective API paths

## Integration with Architectural Layers

The Main module integrates all architectural layers of the application:

**Layer Relationships:**

- **Main Module**
  - Orchestrates the entire application
  - ↓
- **Interfaces Layer**
  - Handles HTTP requests/responses
  - Controllers, Routes, Middleware
  - ↓
- **Application Layer**
  - Implements business use cases
  - Orchestrates domain objects
  - ↓
- **Domain Layer**
  - Core business entities and rules
  - Repository interfaces
  - ↑
- **Infrastructure Layer**
  - Implements repository interfaces
  - Provides technical capabilities
  - Connects to external services

The Main module:

- Imports and configures the Interfaces Layer (controllers, routes, middleware)
- Indirectly enables the Application Layer (use cases) via dependency injection
- Connects to the Infrastructure Layer for database and external services
- Has no direct connection to the Domain Layer, respecting the dependency rule

This composition approach ensures each architectural layer remains focused on its responsibilities while the Main module handles the integration concerns.
