import * as fs from "fs";
import * as path from "path";
import { inject, injectable } from "tsyringe";
import * as TJS from "typescript-json-schema";
import { LOGGER, Logger } from "../logger/Logger";

@injectable()
export class SwaggerSchemaGenerator {
  constructor(@inject(LOGGER) private readonly logger: Logger) {
    this.logger.setOrganizationAndContext("SwaggerSchemaGenerator");
  }

  generateSchemas(): Record<string, any> {
    this.logger.info("Generating Swagger schemas from TypeScript types");

    try {
      // Settings for schema generation
      const settings: TJS.PartialArgs = {
        required: true,
        propOrder: true,
        ref: false,
        noExtraProps: true,
        validationKeywords: ["example", "description"],
        ignoreErrors: true,
      };

      // Get compiler options from tsconfig
      const configPath = path.resolve("./tsconfig.json");
      this.logger.debug(`Using tsconfig at: ${configPath}`);
      let compilerOptions: any = {};

      try {
        const configFile = JSON.parse(fs.readFileSync(configPath, "utf8"));
        compilerOptions = configFile.compilerOptions || {};

        // Add essential compiler options that might be missing
        compilerOptions.noEmit = true;
        compilerOptions.emitDecoratorMetadata = true;
        compilerOptions.experimentalDecorators = true;
      } catch (configError: any) {
        this.logger.warn(
          `Error loading tsconfig: ${configError.message}. Using default settings.`
        );
      }

      // Find all DTO files
      const requestDtoDir = path.resolve("./src/interfaces/dtos/request");
      const responseDtoDir = path.resolve("./src/interfaces/dtos/response");

      const requestDtoFiles = this.findTsFiles(requestDtoDir);
      const responseDtoFiles = this.findTsFiles(responseDtoDir);

      const allDtoFiles = [...requestDtoFiles, ...responseDtoFiles];

      if (allDtoFiles.length === 0) {
        this.logger.error(
          "No DTO files found. Schema generation cannot proceed."
        );
        throw new Error("No DTO files found for schema generation");
      }

      // Log sample file paths for debugging
      this.logger.info(`Found ${allDtoFiles.length} DTO files`);

      try {
        // Create a program from the files
        this.logger.debug("Creating TypeScript program from files...");
        const program = TJS.getProgramFromFiles(
          allDtoFiles,
          compilerOptions,
          "./"
        );

        // Generate schema with ignoreErrors set to true
        this.logger.debug(
          "Building schema generator with ignoreErrors: true..."
        );
        const generator = TJS.buildGenerator(program, settings, allDtoFiles);

        if (!generator) {
          this.logger.error(
            "Failed to create schema generator - generator is null"
          );

          // As a fallback, return an empty schema dictionary
          this.logger.warn("Returning empty schema dictionary as fallback");
          return {};
        }

        // Extract all defined types
        const symbols = generator.getUserSymbols();
        this.logger.debug(`Found ${symbols.length} symbols in user code`);

        const schemas: Record<string, any> = {};

        // Generate schema for each type
        for (const symbol of symbols) {
          // Only process DTO classes
          if (symbol.endsWith("Dto")) {
            try {
              const schema = generator.getSchemaForSymbol(symbol);
              schemas[symbol] = schema;
              // this.logger.debug(`Generated schema for ${symbol}`);
            } catch (symbolError: any) {
              this.logger.warn(
                `Failed to generate schema for ${symbol}: ${symbolError.message}`
              );
            }
          }
        }

        this.logger.info(
          `Successfully generated ${Object.keys(schemas).length} schemas`
        );
        return schemas;
      } catch (programError: any) {
        this.logger.error(
          `Error creating TypeScript program or generator: ${programError.message}`
        );
        // As a fallback, return an empty schema dictionary
        this.logger.warn("Returning empty schema dictionary due to error");
        return {};
      }
    } catch (error: any) {
      this.logger.error(`Schema generation failed: ${error.message}`);
      // Return an empty schema as a fallback instead of throwing
      return {};
    }
  }

  private findTsFiles(dir: string): string[] {
    const files: string[] = [];

    try {
      if (!fs.existsSync(dir)) {
        this.logger.warn(`Directory does not exist: ${dir}`);
        return files;
      }

      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          files.push(...this.findTsFiles(fullPath));
        } else if (
          item.name.endsWith(".ts") &&
          !item.name.endsWith(".spec.ts") &&
          !item.name.endsWith(".d.ts") // Skip declaration files
        ) {
          files.push(fullPath);
        }
      }
    } catch (error: any) {
      this.logger.error(
        `Error finding TypeScript files in ${dir}: ${error.message}`
      );
    }

    return files;
  }
}
