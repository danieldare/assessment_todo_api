import { Environ } from './enums';
import { Pagination } from './types';

export interface IAppConfig {
  /**
   * The environment where the app is running.
   */
  NODE_ENV: Environ;
  /**
   * The port the server listens on for requests.
   */
  PORT: number;
  /**
   *  The root path of the app.
   */
  ROOTPATH?: string;
  /**
   *  The host name for DB.
   */
  DBHOST: string;
  /**
   *  The DB host port.
   */
  DBPORT: number;

  /**
   *  The DB name.
   */
  DBDATABASE: string;

  /**
   *  The DB name for the test environment.
   */
  TEST_DBDATABASE: string;
  /**
   *  The user name for DB authentication.
   */
  DBUSER: string;
  /**
   *  The user password for DB authentication.
   */
  DBPASSWORD: string;
  /**
   *  The DB url, used when the individual credentials are not provided.
   */
  DATABASE_URL?: string;
  /**
   *  A boolean that determines whether the sql queries would show up on the log.
   */
  DATABASE_LOGGING?: boolean;

  JWT_EXPIRES_IN: number;

  JWT_SECRET: string;
}

export interface JWTClaims {
  /**
   * The user id.
   */
  id: string;
  /**
   * The user email.
   */
  email: string;
  /**
   * The token version.
   */
  tokenVersion: number;
}

export interface JWTSignedData {
  /**
   *  The JWT token.
   */
  token: string;

  /**
   * Expressed as a number describing a
   * time span in milliseconds that corresponds to the expire date.
   * Can be useful for setting the expires option on `res.cookie`.
   */
  expires?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface IResponse<T> {
  status: string;
  data: T;
  pagination?: Pagination;
}
