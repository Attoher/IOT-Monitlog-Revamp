import express, { Request, Response } from 'express';
import { InfluxDB, Point , QueryApi } from '@influxdata/influxdb-client';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './models/index'; // Koneksi ke database dengan sequelize
import appLogin from './app'; // Import appLogin dari file lain
import router from './routes/userRoutes';

dotenv.config();

const app = express();
const port = 3000;

// Konfigurasi InfluxDB
const influxDBUrl = process.env.INFLUXDB_URL || 'https://us-east-1-1.aws.cloud2.influxdata.com';
const token = process.env.INFLUXDB_TOKEN;
const org = process.env.INFLUXDB_ORG || '7da30775cb9d6cea';
const suhuBucket = process.env.INFLUXDB_SUHU_BUCKET || 'dataIotSuhu';
const kelembapanBucket = process.env.INFLUXDB_KELEMBAPAN_BUCKET || 'dataIOTKelembapan';
const listrikBucket = process.env.INFLUXDB_LISTRIK_BUCKET || 'dataIOTListrik';

if (!token) {
  throw new Error('InfluxDB token is not defined');
}

const influxDB = new InfluxDB({ url: influxDBUrl, token });

const publicPath = path.resolve(process.cwd(), './src/public');

app.use(express.json());
app.use(express.static(publicPath));

// Middleware untuk API dengan prefix '/api'
app.use('/api', router);

// Gabungkan rute dari appLogin
app.use(appLogin);

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Helper function: Query data dari InfluxDB
const queryData = async (bucket: string): Promise<Record<string, unknown>[]> => {
  const queryApi: QueryApi = influxDB.getQueryApi(org);
  const query = `from(bucket: "${bucket}") |> range(start: -1h)`; // Adjusted range time to last 1 hour
  const results: Record<string, unknown>[] = [];

  return new Promise((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        results.push(tableMeta.toObject(row));
      },
      error(error) {
        console.error(`Error querying ${bucket}:`, error);
        reject(new Error(`Error querying ${bucket}: ${error.message}`));
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

// Rute untuk data berdasarkan timestamp
app.get('/data/timestamp', async (req: Request, res: Response) => {
  const { time } = req.query;

  if (!time) {
    return res.status(400).json({ error: 'Timestamp (time) parameter is required.' });
  }

  try {
    const queryDataByTimestamp = async (bucket: string, time: string) => {
      const queryApi: QueryApi = influxDB.getQueryApi(org);
      const query = `
         from(bucket: "${bucket}")
         |> range(start: ${time}, stop: ${time})
         |> filter(fn: (r) => r._field == "value")
         |> last()
      `;

      const results: Record<string, unknown>[] = [];
      return new Promise((resolve, reject) => {
        queryApi.queryRows(query, {
          next(row, tableMeta) {
            results.push(tableMeta.toObject(row));
          },
          error(error) {
            reject(new Error(`Error querying ${bucket} by timestamp: ${error.message}`));
          },
          complete() {
            resolve(results);
          },
        });
      });
    };

    const [suhuData, kelembapanData, listrikData] = await Promise.all([
      queryDataByTimestamp(suhuBucket, String(time)),
      queryDataByTimestamp(kelembapanBucket, String(time)),
      queryDataByTimestamp(listrikBucket, String(time)),
    ]);

    res.json({
      suhu: suhuData,
      kelembapan: kelembapanData,
      listrik: listrikData,
    });
  } catch (error) {
    console.error('Error fetching data by timestamp:', error);
    res.status(500).send('Error fetching data by timestamp.');
  }
});

// Eksport aplikasi untuk Vercel
export default app;
