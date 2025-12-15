
import { DomainError } from '../../shared/errors/DomainError.js';

export class UnderagePersonError extends DomainError {
  constructor(name: string) {
    super(`Person ${name} is underage`);
  }
}
