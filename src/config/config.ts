import dotenv from 'dotenv';

dotenv.config();

export default {
  database: process.env.DATABASE_NAME as string,
  username: process.env.DATABASE_USER as string,
  password: process.env.DATABASE_PASSWORD as string,
  host: process.env.DATABASE_HOST as string,
  dialect: 'postgres' as const,
  secretKey: process.env.SECRET_KEY as string,
};
