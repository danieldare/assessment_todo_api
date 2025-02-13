import 'dotenv/config';
import { join } from 'path';
import env from '../config';
import { DataSourceOptions } from 'typeorm';
import { Environ } from '../types';

const formFullPath = (ref: string) => join(env.ROOTPATH!, ref);

/**
 * Array of entity file paths.
 *
 */
const entities = [
  formFullPath('./src/**/*.entity.js'),
  formFullPath('./src/**/*.entity.ts'),
];

/**
 * Array of file paths for database migrations.
 * The paths include both TypeScript and JavaScript migration files.
 */
const migrations = [
  formFullPath('./src/database/migrations/*.js'),
  formFullPath('./src/database/migrations/*.ts'),
];

/**
 * Retrieves the connection options for the database.
 * If `DATABASE_URL` environment variable is set, it returns the options with the URL.
 * Otherwise, it returns the options with the individual database connection details.
 * @returns The connection options for the database.
 */
const getConnectionOptions = () => ({
  ...(env.DATABASE_URL
    ? { url: env.DATABASE_URL }
    : {
        host: env.DBHOST,
        port: env.DBPORT,
        username: env.DBUSER,
        password: env.DBPASSWORD,
        database:
          env.NODE_ENV === Environ.test ? env.TEST_DBDATABASE : env.DBDATABASE,
      }),
});

/**
 * Configuration options for the database connection.
 */
export const config: DataSourceOptions = {
  type: 'mysql',
  ...getConnectionOptions(),
  migrations,
  migrationsRun: env.NODE_ENV !== Environ.test,
  entities,
  synchronize: env.NODE_ENV === Environ.test,
  logging: env.DATABASE_LOGGING ? ['query', 'error'] : [],
};
