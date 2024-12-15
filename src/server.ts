import express, { Request, Response } from 'express';
import { InfluxDB, WriteApi, QueryApi } from '@influxdata/influxdb-client';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './models/index'; // Koneksi ke database dengan sequelize
import multer from 'multer';
import appLogin from './app'; // Import appLogin dari file lain

dotenv.config();

const upload = multer({ dest: 'uploads/' });
const app = express();
const port = 3000;

// Konfigurasi InfluxDB
const influxDBUrl = 'http://localhost:8086';
const token = 'aflLC2CIRvmQWgF4gGEga-7O3fGEPtEDuTwcYtQtqc_rd1wK-FM9uxH6o_mrRx-lTfs7JuMhzQJxDY1G74rB5A==';
const org = '379932e683da78f5';
const suhuBucket = 'dataIotSuhu';
const kelembapanBucket = 'dataIOTKelembapan';
const listrikBucket = 'dataIOTListrik';

const influxDB = new InfluxDB({ url: influxDBUrl, token });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Untuk static file seperti HTML, CSS, JS

// Gabungkan rute dari appLogin
app.use(appLogin);

// Helper function: Query data dari InfluxDB
const queryData = async (bucket: string): Promise<Record<string, unknown>[]> => {
  const queryApi: QueryApi = influxDB.getQueryApi(org);
  const query = `from(bucket: "${bucket}") |> range(start: 0)`; // Sesuaikan range waktu
  const results: Record<string, unknown>[] = [];

  return new Promise((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        results.push(tableMeta.toObject(row));
      },
      error(error) {
        console.error(`Error querying ${bucket}:`, error);
        reject(error);
      },
      complete() {
        resolve(results);
      },
    });
  });
};

// Endpoint untuk data suhu
app.get('/data/suhu', async (req: Request, res: Response) => {
  try {
    const data = await queryData(suhuBucket);
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching data for suhu.');
  }
});

// Endpoint untuk data kelembapan
app.get('/data/kelembapan', async (req: Request, res: Response) => {
  try {
    const data = await queryData(kelembapanBucket);
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching data for kelembapan.');
  }
});

// Endpoint untuk data konsumsi listrik
app.get('/data/konsumsiListrik', async (req: Request, res: Response) => {
  try {
    const data = await queryData(listrikBucket);
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching data for konsumsi listrik.');
  }
});

// Rute utama untuk aplikasi login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server untuk aplikasi IoT dan login pada port 3000
const startServer = async () => {
  try {
    // Authenticate database login (PostgreSQL)
    await sequelize.authenticate();
    console.log('Database connected!');
    await sequelize.sync();

    // Start aplikasi IoT dan login di port 3000
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Mulai server
startServer();
