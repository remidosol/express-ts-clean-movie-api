import { injectable } from "tsyringe";
import * as winston from "winston";
import { ConsoleTransportInstance } from "winston/lib/winston/transports";
import { AbstractLogger } from "../AbstractLogger";
import { LogData, LogLevel } from "../types";
import { ConsoleTransport } from "./consoleTransport";

export const LOGGER_BASE = Symbol();

@injectable()
export class WinstonLogger extends AbstractLogger {
  private readonly logger: winston.Logger;
  private readonly transports: ConsoleTransportInstance[] = [
    ConsoleTransport.createColorize(), // Colorize the output
  ];

  public constructor() {
    super();

    // Create winston logger
    this.logger = winston.createLogger(
      this.getLoggerFormatOptions(this.transports)
    );
  }

  /**
   * Log a message
   * @param level Log level
   * @param message Log message
   * @param data Log data
   * @param profile Log profile
   *
   * @example
   * ```ts
   * logger.log(LogLevel.Info, "This is a log message", { key: "value" }, "profile");
   * ```
   *
   * @example
   * ```ts
   * logger.log(LogLevel.Info, new Error("This is an error message"), { key: "value" }, "profile");
   * ```
   */
  log(
    level: LogLevel,
    message: string | Error,
    data?: LogData,
    profile?: string
  ) {
    try {
      const logData = {
        level,
        message: message instanceof Error ? message.message : message,
        error: message instanceof Error ? message : undefined,
        ...data,
      };

      if (profile) {
        this.logger.profile(profile, logData);
      } else {
        this.logger.log(logData);
      }
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Log a debug message
   *
   * @param message
   * @param data
   * @param profile
   */
  public debug(message: string, data?: LogData, profile?: string) {
    this.log(LogLevel.Debug, message, data, profile);
  }

  /**
   * Log an info message
   *
   * @param message
   * @param data
   * @param profile
   */
  public info(message: string, data?: LogData, profile?: string) {
    this.log(LogLevel.Info, message, data, profile);
  }

  /**
   * Log an warn message
   *
   * @param message
   * @param data
   * @param profile
   */
  public warn(message: string | Error, data?: LogData, profile?: string) {
    this.log(LogLevel.Warn, message, data, profile);
  }

  /**
   * Log an error message
   *
   * @param message
   * @param data
   * @param profile
   */
  public error(message: string | Error, data?: LogData, profile?: string) {
    this.log(LogLevel.Error, message, data, profile);
  }

  /**
   * Start a profile
   *
   * @param id
   */
  public startProfile(id: string) {
    this.logger.profile(id);
  }

  /**
   * Get the logger format options
   *
   * @param transports
   * @returns
   */
  private getLoggerFormatOptions(
    transports: winston.transport[]
  ): winston.LoggerOptions {
    // Setting log levels for winston
    const levels: any = {};
    let cont = 0;
    Object.values(LogLevel).forEach((level) => {
      levels[level] = cont;
      cont++;
    });

    return {
      level: LogLevel.Debug,
      format: winston.format.combine(
        winston.format.timestamp({
          format: "DD/MM/YYYY, HH:mm:ss",
        }),

        winston.format((log, _opts) => {
          if (log.error && log.error instanceof Error) {
            log.stack = log.error.stack;
            log.error = undefined;
          }

          log.label = `${log.organization}.${log.context}`;

          return log;
        })(),

        winston.format.metadata({
          key: "data",
          fillExcept: ["timestamp", "level", "message"],
        }),

        winston.format.json()
      ),
      levels,
      transports,
      exceptionHandlers: transports,
      rejectionHandlers: transports,
    };
  }
}
