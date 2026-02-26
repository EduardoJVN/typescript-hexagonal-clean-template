import { PinoLogger } from '@infra/services/pino-logger.service.js';
import { z } from 'zod';

const logger = new PinoLogger();

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
});

const env = envSchema.parse(process.env);

logger.info(`🚀 Template iniciado en modo: ${env.NODE_ENV}`);
logger.info('✅ Alias @infra funcionando correctamente');
