
export abstract class DomainError extends Error {
  readonly type = 'DOMAIN_ERROR';
}
