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
const influxDBUrl = 'http://localhost:8086';
const token = 'aflLC2CIRvmQWgF4gGEga-7O3fGEPtEDuTwcYtQtqc_rd1wK-FM9uxH6o_mrRx-lTfs7JuMhzQJxDY1G74rB5A==';
const org = '379932e683da78f5';
const suhuBucket = 'dataIotSuhu';
const kelembapanBucket = 'dataIOTKelembapan';
const listrikBucket = 'dataIOTListrik';


const influxDB = new InfluxDB({ url: influxDBUrl, token });


app.use(express.static(path.join(__dirname, './')));

// Middleware untuk body parsing JSON
app.use(express.json());

// Middleware untuk API dengan prefix '/api'
app.use('/api', router);


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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

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
  res.sendFile(path.join(__dirname, './index.html'));
});

app.post('/data', async (req: Request, res: Response) => {
  const { bucket, data } = req.body;

  // Validasi input
  if (!bucket || !data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid input. Ensure bucket and data are provided.' });
  }

  try {
    // Buat instance WriteApi untuk menulis data ke InfluxDB
    const writeApi = influxDB.getWriteApi(org, bucket);
    writeApi.useDefaultTags({ source: 'postman' }); // Tambahkan tag default

    // Buat Point dari data yang dikirim
    const point = new Point('measurement')
      .tag('source', 'postman') // Tambahkan tag (opsional)
      .floatField('value', data.value) // Field utama
      .timestamp(new Date());

    // Tulis data ke InfluxDB
    writeApi.writePoint(point);
    await writeApi.close();

    res.status(201).json({ message: 'Data written to InfluxDB successfully.' });
  } catch (error) {
    console.error('Error writing data to InfluxDB:', error);
    res.status(500).json({ error: 'Failed to write data to InfluxDB.' });
  }
});

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
            reject(error);
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
