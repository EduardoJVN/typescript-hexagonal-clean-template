
import { describe, it, expect } from 'vitest';
import { Person } from '../src/domain/person/Person.js';
import { UnderagePersonError } from '../src/domain/person/PersonErrors.js';

describe('Person domain', () => {
  it('throws if underage', () => {
    const person = new Person('1', 'Test', 10);
    expect(() => person.validate()).toThrow(UnderagePersonError);
  });
});
