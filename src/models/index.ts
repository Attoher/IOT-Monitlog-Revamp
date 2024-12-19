import { Sequelize } from 'sequelize';
import config from '../config/config';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'todolist',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgrexx2',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
  }
);

export default sequelize;
