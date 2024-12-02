import express, { Request, Response } from 'express';
import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './models/index';
import appLogin from './app';

dotenv.config();

const app = express();
const port = 3000;

const influxDBUrl = 'http://localhost:8086';
const token = 'HWcPWyM5YSa9atjk-OjDTmFAfjvrj962jj7EQcdH7dWqg81wGM55bGizVZwxXJWoOzA97kZt85tMKXv3JzsXuQ==';
const org = '06894bea11cc3250';

// Buckets for Suhu, Kelembapan, and KonsumsiListrik
const suhuBucket = 'dataIotSuhu';
const kelembapanBucket = 'dataIotKelembapan';
const listrikBucket = 'dataIotListrik';

const influxDB = new InfluxDB({ url: influxDBUrl, token });

app.use(express.json());
appLogin.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'public')));

// Helper function to query data
const queryData = async (bucket: string, res: Response): Promise<void> => {
  const queryApi: QueryApi = influxDB.getQueryApi(org);
  const query = `from(bucket: "${bucket}") |> range(start: 0)`; // Adjust range as necessary

  try {
    const results: Record<string, unknown>[] = [];
    await queryApi.queryRows(query, {
      next(row: string[], tableMeta: { toObject: (row: string[]) => Record<string, unknown> }) {
        const o = tableMeta.toObject(row);
        results.push(o);
      },
      error(error: Error) {
        console.error(error);
        res.status(500).send('Error fetching data from InfluxDB');
      },
      complete() {
        res.json(results);
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error executing query');
  }
};



// Endpoint untuk suhu data
app.get('/data/suhu', async (req: Request, res: Response) => {
  await queryData(suhuBucket, res);
});

// Endpoint untuk kelembapan data
app.get('/data/kelembapan', async (req: Request, res: Response) => {
  await queryData(kelembapanBucket, res);
});

// Endpoint untuk konsumsi listrik data
app.get('/data/konsumsiListrik', async (req: Request, res: Response) => {
  await queryData(listrikBucket, res);
});

appLogin.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server and connect to database
const startServerIot = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    await sequelize.sync();
    const loginPort = 3000;
    appLogin.listen(loginPort, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

    const iotPort = 4000; // Port untuk appIot
    app.listen(iotPort, () => {
      console.log(`AppIot running at http://localhost:${iotPort}`);
    });

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServerIot();