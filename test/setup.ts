import { config } from 'dotenv';
import { AllExceptionsFilter } from '../src/filters';
import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { formatValidationError } from '../src/common';

config({ path: '.env' });

export const addAppFixtures = (app: INestApplication) => {
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

  return app;
};
