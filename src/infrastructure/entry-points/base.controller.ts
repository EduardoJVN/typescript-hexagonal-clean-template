import { DomainError } from '@shared/errors/domain.error.js';
import { NotFoundError } from '@shared/errors/not-found.error.js';

export interface ErrorResponse {
  status: number;
  message: string;
}

export abstract class BaseController {
  protected async handleRequest<T>(
    action: () => Promise<T>,
    onSuccess: (result: T) => void,
    onError: (error: ErrorResponse) => void,
  ): Promise<void> {
    try {
      const result = await action();
      onSuccess(result);
    } catch (error) {
      if (error instanceof NotFoundError) {
        onError({ status: 404, message: error.message });
      } else if (error instanceof DomainError) {
        onError({ status: 400, message: error.message });
      } else {
        onError({ status: 500, message: 'Internal server error' });
      }
    }
  }
}
