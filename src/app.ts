
import { Logger } from './shared/logger/Logger.js';
import { GlobalErrorHandler } from './shared/errors/GlobalErrorHandler.js';
import { EventBus } from './domain/events/EventBus.js';
import { InMemoryPersonRepository } from './infrastructure/person/InMemoryPersonRepository.js';
import { CreatePerson } from './application/person/CreatePerson.js';

const logger = new Logger();
GlobalErrorHandler.init(logger);

const eventBus = new EventBus();
eventBus.subscribe('PersonCreatedEvent', async e => {
  logger.info(`Person created with id ${e.personId}`);
});

const repo = new InMemoryPersonRepository();
const createPerson = new CreatePerson(repo, eventBus);

// Example execution
await createPerson.execute('Juan', 15);
