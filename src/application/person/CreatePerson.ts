
import { PersonRepository } from '../../domain/person/PersonRepository.js';
import { EventBus } from '../../domain/events/EventBus.js';
import { Person } from '../../domain/person/Person.js';

export class CreatePerson {
  constructor(
    private readonly repo: PersonRepository,
    private readonly bus: EventBus
  ) {}

  async execute(name: string, age: number) {
    const person = new Person(crypto.randomUUID(), name, age);
    person.validate();
    person.markCreated();

    await this.repo.save(person);
    await this.bus.publish(person.pullEvents());
  }
}
