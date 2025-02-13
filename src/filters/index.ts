import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Environ } from '../types';
import constants from '../constants';

type GenericException = Omit<HttpException, 'status'> & {
  code: number;
  status: number;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger('Exception Filter');

  #formatDatabaseError(exceptionCode: string) {
    switch (exceptionCode) {
      case 'ER_DUP_ENTRY': // Unique constraint violation
        return {
          message: constants.CONFLICT,
          exceptionCode: 'CONFLICT',
          status: 409,
        };

      case 'ER_NO_REFERENCED_ROW_2': // Foreign key violation
        return {
          message: constants.FOREIGN_KEY_VIOLATION,
          exceptionCode: 'FOREIGN_KEY_VIOLATION',
          status: 400,
        };

      case 'ER_BAD_NULL_ERROR': // Not null violation
        return {
          message: constants.REQUIRED_FIELD_MISSING,
          exceptionCode: 'REQUIRED_FIELD_MISSING',
          status: 400,
        };

      case 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD': // Invalid input syntax
        return {
          message: constants.INVALID_INPUT_FORMAT,
          exceptionCode: 'INVALID_INPUT_FORMAT',
          status: 400,
        };

      default:
        return {
          message: constants.INTERNAL_SERVER_ERROR,
          exceptionCode: 'INTERNAL_SERVER_ERROR',
          status: 500,
        };
    }
  }

  catch(exception: GenericException, host: ArgumentsHost): void {
    const ctx = host?.switchToHttp();
    const response = ctx?.getResponse();
    const request = ctx?.getRequest();
    let message: string | string[] = constants.INTERNAL_SERVER_ERROR;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    const reason = (exception as Error).message;

    if (process.env.NODE_ENV !== Environ.test)
      this.logger.error('Error stack:' + (exception as Error).stack);

    if (exception instanceof HttpException) {
      status = (exception as HttpException).getStatus();
      const errorBody = ((exception as HttpException)?.getResponse() || {}) as
        | Record<string, string | string[]>
        | string;
      if (typeof errorBody === 'string') {
        message = errorBody;
      } else if (errorBody.message instanceof Array) {
        message = errorBody.message[0];
      } else {
        message = errorBody.message || errorBody.error || message;
      }
    }

    const exceptionName = exception.name ?? exception?.constructor?.name;

    if (
      exceptionName === 'QueryFailedError' ||
      exceptionName === 'TypeORMError'
    ) {
      const code = exception?.code ?? exception?.status;
      const formattedError = this.#formatDatabaseError(String(code));
      message = formattedError.message;
      status = formattedError.status;
    }

    if (process.env.NODE_ENV !== Environ.test)
      this.logger.error(
        `[${new Date().toUTCString()}]: - [${exceptionName}] - url: ${request.originalUrl} : - ${status} - ${message} ${
          reason ? '- reason :- ' + reason : ''
        }`,
      );

    response.status(status).json({
      status: 'fail',
      error: message,
    });
  }
}
