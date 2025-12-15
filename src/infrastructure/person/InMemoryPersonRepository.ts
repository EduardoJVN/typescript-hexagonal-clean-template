
import { PersonRepository } from '../../domain/person/PersonRepository.js';
import { Person } from '../../domain/person/Person.js';

export class InMemoryPersonRepository implements PersonRepository {
  async save(person: Person): Promise<void> {
    console.log('Saved:', person);
  }
}
