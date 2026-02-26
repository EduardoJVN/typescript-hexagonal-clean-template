import { DomainError } from './DomainError.js';
import { Logger } from '../logger/Logger.js';

export class GlobalErrorHandler {
  static init(logger: Logger) {
    process.on('uncaughtException', (e) => this.handle(e, logger));
    process.on('unhandledRejection', (e) => this.handle(e, logger));
  }

  static handle(error: unknown, logger: Logger) {
    if (error instanceof DomainError) {
      logger.error(error.message);
      process.exit(2);
    }
    if (error instanceof Error) {
      logger.error(error.stack ?? error.message);
      process.exit(1);
    }
    logger.error('Unknown fatal error');
    process.exit(99);
  }
}
