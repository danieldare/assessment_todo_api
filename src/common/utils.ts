import { ValidationError } from 'class-validator';
import constants from '../constants';

export const formatErrorResponse = (message: string) => ({
  status: 'fail',
  message,
});

export const formatValidationError = (error: ValidationError) => {
  const constraints = error.constraints;
  let message = 'invalid data';
  if (constraints) {
    const property = Object.keys(constraints)[0];
    message = constraints[property];
  }
  return formatErrorResponse(message);
};

export const getRouteV1 = (route: string) => `/${constants.V1}/${route}`;
