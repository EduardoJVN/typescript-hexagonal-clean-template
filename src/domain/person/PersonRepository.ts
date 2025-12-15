
import { Person } from './Person.js';

export interface PersonRepository {
  save(person: Person): Promise<void>;
}
