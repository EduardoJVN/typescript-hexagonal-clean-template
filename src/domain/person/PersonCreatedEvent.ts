
import { DomainEvent } from '../events/DomainEvent.js';

export class PersonCreatedEvent implements DomainEvent {
  readonly name = 'PersonCreatedEvent';
  readonly occurredAt = new Date();

  constructor(public readonly personId: string) {}
}
