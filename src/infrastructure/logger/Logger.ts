import { inject, injectable } from "tsyringe";
import { CONFIG, Config } from "../config";
import { AbstractLogger } from "./AbstractLogger";
import { LogData, LogLevel } from "./types";
import { LOGGER_BASE, WinstonLogger } from "./winston/winstonLogger";

export const LOGGER = Symbol("LOGGER");

@injectable()
export class Logger extends AbstractLogger {
  private organization: string;

  private context: string;

  private readonly app: string;

  public constructor(
    @inject(LOGGER_BASE) private readonly logger: WinstonLogger,
    @inject(CONFIG) config: Config
  ) {
    super();
    this.organization = config.getOrThrow("APP_NAME");
    this.context = "Log";
    this.app = config.getOrThrow("APP_NAME");
  }

  /**
   * Set the organization and context for the logger
   *
   * @param context
   * @param organization
   */
  public setOrganizationAndContext(context?: string, organization?: string) {
    if (organization) {
      this.organization = organization;
    }

    if (context) {
      this.context = context;
    }
  }

  /**
   * Log a message
   *
   * @param level LogLevel
   * @param message
   * @param data
   * @param profile
   */
  protected log(
    level: LogLevel,
    message: string | Error,
    data?: LogData,
    profile?: string
  ) {
    return this.logger.log(level, message, this.getLogData(data), profile);
  }

  /**
   * Log a debug message
   *
   * @param message
   * @param data
   * @param profile
   */
  public debug(message: string, data?: LogData, profile?: string) {
    return this.logger.debug(message, this.getLogData(data), profile);
  }

  /**
   * Log an info message
   *
   * @param message
   * @param data
   * @param profile
   */
  public info(message: string, data?: LogData, profile?: string) {
    return this.logger.info(message, this.getLogData(data), profile);
  }

  /**
   * Log a warn message
   *
   * @param message
   * @param data
   * @param profile
   */
  public warn(message: string | Error, data?: LogData, profile?: string) {
    return this.logger.warn(message, this.getLogData(data), profile);
  }

  /**
   * Log an error message
   *
   * @param message
   * @param data
   * @param profile
   */
  public error(message: string | Error, data?: LogData, profile?: string) {
    return this.logger.error(message, this.getLogData(data), profile);
  }

  private getLogData(data?: LogData): LogData {
    return {
      ...data,
      organization: data?.organization || this.organization,
      context: data?.context || this.context,
      app: data?.app || this.app,
      sourceClass: data?.sourceClass,
    };
  }

  public startProfile(id: string) {
    this.logger.startProfile(id);
  }
}
