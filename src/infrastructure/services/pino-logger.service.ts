import pino from 'pino';
import type { Logger as PinoInstance } from 'pino';
import type { ILogger } from '@core/ports/logger.port';

export class PinoLogger implements ILogger {
  private logger: PinoInstance;

  constructor(level: string = 'info') {
    this.logger = pino({
      level,
      // Aquí podrías añadir pino-pretty si estás en desarrollo
      transport: process.env.NODE_ENV !== 'production' 
        ? { target: 'pino-pretty' } 
        : undefined,
    });
  }

  info(msg: string, ...args: any[]) { this.logger.info(msg, ...args); }
  error(msg: string, ...args: any[]) { this.logger.error(msg, ...args); }
  warn(msg: string, ...args: any[]) { this.logger.warn(msg, ...args); }
  debug(msg: string, ...args: any[]) { this.logger.debug(msg, ...args); }
  trace(msg: string, ...args: any[]) { this.logger.trace(msg, ...args); }
}