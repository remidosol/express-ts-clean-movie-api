export enum LogLevel {
  Error = "error", // Error events are likely to cause problems
  Warn = "warn", // Warning events might cause problems in the future and deserve eyes
  Info = "info", // Routine information, such as ongoing status or performance
  Debug = "debug", // Debug or trace information
}

export interface LogData {
  organization?: string; // Organization or project name
  context?: string; // Bounded Context name
  app?: string; // Application or Microservice name
  sourceClass?: string; // Classname of the source
  correlationId?: string; // Correlation ID
  error?: Error | Error[]; // Error object
  props?: NodeJS.Dict<any>; // Additional custom properties
}

export interface Log {
  timestamp: number; // Unix timestamp
  level: LogLevel; // Log level
  message: string; // Log message
  data: LogData; // Log data
}
