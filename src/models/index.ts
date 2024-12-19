import { Sequelize } from 'sequelize';
import config from '../config/config';


interface Config {
  database: string;
  username: string;
  password: string;
  host: string;
  dialect: any; 
}


const dbConfig: Config = {
  database: config.database || '',
  username: config.username || '',
  password: config.password || '',
  host: config.host || 'localhost',
  dialect: config.dialect || 'mysql',
};

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: false, 
});


sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

export default sequelize;
