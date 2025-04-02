import { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { inject, injectable } from "tsyringe";
import { BadRequestExceptionMessages } from "../../interfaces/constants/exception-messages";
import { CONFIG, Config } from "../config";
import { LOGGER, Logger } from "../logger/Logger";
import { SwaggerSchemaGenerator } from "./SwaggerSchemaGenerator";

@injectable()
export class SwaggerDocs {
  constructor(
    @inject(LOGGER) private readonly logger: Logger,
    @inject(CONFIG) private readonly config: Config,
    private readonly schemaGenerator: SwaggerSchemaGenerator
  ) {
    this.logger.setOrganizationAndContext("SwaggerDocs");
  }

  setup(app: Express): void {
    this.logger.info("Setting up Swagger documentation");

    // Generate schemas automatically from TypeScript DTOs
    const generatedSchemas = this.schemaGenerator.generateSchemas();

    const appName = this.config.getOrThrow("APP_NAME");
    const swaggerOptions: swaggerJSDoc.Options = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: `${appName} Documentation`,
          version: "1.0.0",
          description: "API documentation for the Clean Movie API",
          license: {
            name: "MIT",
            url: "https://opensource.org/licenses/MIT",
          },
        },
        servers: [
          {
            url: `http://${this.config.getOrThrow("HOST")}:${this.config.getOrThrow("PORT")}`,
            description: "Development server",
          },
        ],
        components: {
          schemas: {
            ...generatedSchemas,
            Error: {
              type: "object",
              properties: {
                statusCode: { type: "number", example: 400 },
                message: {
                  type: "string",
                  example: BadRequestExceptionMessages.PROVIDE_VALID_DATE,
                },
                error: { type: "string", example: "Bad Request" },
              },
            },
          },
        },
      },
      apis: ["./src/interfaces/http/controllers/*.ts"],
    };

    const swaggerSpec = swaggerJSDoc(swaggerOptions);

    if (this.config.get("NODE_ENV") !== "production") {
      app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
      app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
      });
    }

    this.logger.info("Swagger documentation setup completed");
  }
}
