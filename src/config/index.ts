import 'dotenv/config';
import { join } from 'path';
import { Environ, IAppConfig } from '../types';

const defaultEnv = process.env as unknown as IAppConfig;

/**
 * The default environment configuration object (polyfilled).
 */
const env: IAppConfig = {
  ...defaultEnv,
  DBPORT: +defaultEnv.DBPORT,
  PORT: +defaultEnv.PORT || 4500,
  NODE_ENV: (defaultEnv.NODE_ENV as Environ) ?? Environ.development,
  ROOTPATH: join(__dirname, '../../'),
  DATABASE_LOGGING:
    (defaultEnv.DATABASE_LOGGING as unknown as string) === 'true',
  JWT_EXPIRES_IN: defaultEnv.JWT_EXPIRES_IN ?? 86400, // 24 hours,
};

export default env;
