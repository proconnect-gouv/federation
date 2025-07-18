import config from './config/database';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource(config);

export default AppDataSource;
