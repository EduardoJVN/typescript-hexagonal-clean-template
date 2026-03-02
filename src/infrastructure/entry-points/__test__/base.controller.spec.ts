import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseController } from '../base.controller.js';
import type { ErrorResponse } from '../base.controller.js';
import { DomainError } from '@shared/errors/domain.error.js';
import { NotFoundError } from '@shared/errors/not-found.error.js';

class TestNotFoundError extends NotFoundError {
  constructor() {
    super('resource not found');
  }
}

class TestDomainError extends DomainError {
  constructor() {
    super('business rule violated');
  }
}

class TestController extends BaseController {
  async run<T>(
    action: () => Promise<T>,
    onSuccess: (result: T) => void,
    onError: (error: ErrorResponse) => void,
  ): Promise<void> {
    return this.handleRequest(action, onSuccess, onError);
  }
}

describe('BaseController', () => {
  let controller: TestController;
  let onSuccess: ReturnType<typeof vi.fn>;
  let onError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    controller = new TestController();
    onSuccess = vi.fn();
    onError = vi.fn();
  });

  it('calls onSuccess with the result on happy path', async () => {
    await controller.run(() => Promise.resolve({ id: '1' }), onSuccess, onError);

    expect(onSuccess).toHaveBeenCalledWith({ id: '1' });
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onError with status 404 when NotFoundError is thrown', async () => {
    await controller.run(() => Promise.reject(new TestNotFoundError()), onSuccess, onError);

    expect(onError).toHaveBeenCalledWith({ status: 404, message: 'resource not found' });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onError with status 400 when a generic DomainError is thrown', async () => {
    await controller.run(() => Promise.reject(new TestDomainError()), onSuccess, onError);

    expect(onError).toHaveBeenCalledWith({ status: 400, message: 'business rule violated' });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onError with status 500 for unknown errors', async () => {
    await controller.run(
      () => Promise.reject(new Error('unexpected DB failure')),
      onSuccess,
      onError,
    );

    expect(onError).toHaveBeenCalledWith({ status: 500, message: 'Internal server error' });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
