
import { UnderagePersonError } from './PersonErrors.js';
import { PersonCreatedEvent } from './PersonCreatedEvent.js';
import { DomainEvent } from '../events/DomainEvent.js';

export class Person {
  private events: DomainEvent[] = [];

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly age: number
  ) {}

  validate() {
    if (this.age < 18) {
      throw new UnderagePersonError(this.name);
    }
  }

  markCreated() {
    this.events.push(new PersonCreatedEvent(this.id));
  }

  pullEvents(): DomainEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }
}
