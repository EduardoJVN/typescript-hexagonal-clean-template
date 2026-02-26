import pino from 'pino';
import type { Level, Logger as PinoLogger } from 'pino';
export type Logger = PinoLogger;

export const Logger = function (this: Logger, level: Level = 'info'): Logger {
  return pino({
    level: level,
  });
} as unknown as { new (level?: Level): Logger };
