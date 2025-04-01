import { LogData, LogLevel } from "./types";

export abstract class AbstractLogger {
  protected abstract log(
    level: LogLevel,
    message: string | Error,
    data?: LogData,
    profile?: string
  ): void;
  abstract debug(message: string, data?: LogData, profile?: string): void;
  abstract info(message: string, data?: LogData, profile?: string): void;
  abstract warn(
    message: string | Error,
    data?: LogData,
    profile?: string
  ): void;
  abstract error(
    message: string | Error,
    data?: LogData,
    profile?: string
  ): void;
  abstract startProfile(id: string): void;
}
