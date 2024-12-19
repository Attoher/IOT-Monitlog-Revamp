import dotenv from 'dotenv';

dotenv.config();

export default {
  database: process.env.DB_NAME || 'todolist',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgrexx2',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
};

