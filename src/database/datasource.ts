import { DataSource } from 'typeorm';
import { config } from './database.config';

/**
 * Represents a data source for the todo-list API, specifically used by typeorm CLI.
 */
export default new DataSource(config);
