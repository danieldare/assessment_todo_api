import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { formatValidationError } from './common';
import { AllExceptionsFilter } from './filters';
import { AppModule } from './app.module';
import apiDocsHandler from './api.doc';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // adds security middleware to handle potential attacks from HTTP requests
  app.use(helmet());

  // adds application rate limiting
  const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 500,
  });

  // only apply to requests that begin with /api/
  app.use('/api/', apiLimiter);

  // integrates swagger docs generator
  apiDocsHandler(app);

  // adds custom exception handling for all endpoints
  app.useGlobalFilters(new AllExceptionsFilter());

  // adds class-validator enabled functionality for all incoming requestsforbidUnknownValues
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => {
        throw new BadRequestException(formatValidationError(errors[0]));
      },
      transform: true,
    }),
  );

  // Fetches the application port from the environment variables.
  const port = configService.get('PORT');

  // listens for requests.
  await app.listen(port);
}
bootstrap();
