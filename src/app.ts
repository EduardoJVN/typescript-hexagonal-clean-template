import { reportBootstrap } from '@infra/config/bootstrap-reporter.js';
import { Logger } from '@infra/adapters/pino-logger.adapter';
import { MockAgentAdapter } from '@infra/ai/adapters/mock-agent.adapter';
import { AnalyzeCommentUseCase } from '@application/ai/use-cases/analyze-comment.use-case';

async function bootstrap() {
  // 1. Instanciar infraestructura
  const logger = new Logger();
  reportBootstrap(logger);
  const aiAgent = new MockAgentAdapter();

  // 2. Inyectar en aplicación
  const analyzer = new AnalyzeCommentUseCase(aiAgent, logger);

  // 3. Ejecutar
  const result = await analyzer.execute("Este template de arquitectura es excelente");
  logger.info('Resultado Final:', { result });
}

bootstrap();