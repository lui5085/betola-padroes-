import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const logger = new Logger('Bootstrap');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  logger.debug('Configurando CORS...');
  app.enableCors({
    origin: [/^http:\/\/localhost:\d+$/],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const PORT = parseInt(process.env.PORT ?? '3002', 10);
  await app.listen(PORT);
  logger.log(`API escutando na porta ${PORT}`);
}
bootstrap();
