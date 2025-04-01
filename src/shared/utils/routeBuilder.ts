import { instanceToPlain } from "class-transformer";
import { RequestHandler, Router } from "express";
import { validationMiddleware } from "../../interfaces/http/middleware";

type HttpMethod = "get" | "post" | "patch" | "delete";

interface RouteConfig {
  method: HttpMethod;
  path: string;
  bodyValidation?: any;
  queryValidation?: any;
  paramsValidation?: any;
  handlers: RequestHandler[];
  transform?: boolean;
}

export function createRouter() {
  const router = Router();

  const addRoute = (config: RouteConfig) => {
    const {
      method,
      path,
      bodyValidation,
      queryValidation,
      paramsValidation,
      handlers,
      transform = true,
    } = config;

    const middlewares: RequestHandler[] = [];

    if (bodyValidation) {
      middlewares.push(validationMiddleware(bodyValidation, "body"));
    }

    if (queryValidation) {
      middlewares.push(validationMiddleware(queryValidation, "query"));
    }

    if (paramsValidation) {
      middlewares.push(validationMiddleware(paramsValidation, "params"));
    }

    // Add response transformation if enabled
    if (transform) {
      // Create a wrapper around the last handler to transform its response
      const originalHandler = handlers[handlers.length - 1];
      handlers[handlers.length - 1] = async (req, res, next) => {
        // Save the original res.json function
        const originalJson = res.json;

        // Override res.json to transform data
        res.json = function (body) {
          return originalJson.call(
            this,
            instanceToPlain(body, {
              excludeExtraneousValues: true,
            })
          );
        };

        // Call the original handler
        return originalHandler(req, res, next);
      };
    }

    router[method](path, ...middlewares, ...handlers);
  };

  return {
    router,
    addRoute,
    get: (path: string, config: Omit<RouteConfig, "method" | "path">) =>
      addRoute({ method: "get", path, ...config }),
    post: (path: string, config: Omit<RouteConfig, "method" | "path">) =>
      addRoute({ method: "post", path, ...config }),
    patch: (path: string, config: Omit<RouteConfig, "method" | "path">) =>
      addRoute({ method: "patch", path, ...config }),
    delete: (path: string, config: Omit<RouteConfig, "method" | "path">) =>
      addRoute({ method: "delete", path, ...config }),
  };
}
