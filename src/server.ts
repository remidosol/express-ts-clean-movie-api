import "reflect-metadata";
import { CONFIG, Config } from "./infrastructure/config";
import { container } from "./infrastructure/di/container";
import { LOGGER, Logger } from "./infrastructure/logger/Logger";
import { app } from "./main/app";
import { bootstrap } from "./main/bootstrap";

async function startServer() {
  const logger = container.resolve<Logger>(LOGGER);
  logger.setOrganizationAndContext("Server");

  try {
    await bootstrap(app);

    const config = container.resolve<Config>(CONFIG);
    const PORT = config.getOrThrow("PORT");

    app.listen(+PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error: any) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
}

startServer();
