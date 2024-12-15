import express, { Request, Response } from 'express';
import { InfluxDB,WriteApi, QueryApi } from '@influxdata/influxdb-client';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './models/index';
import appLogin from './app';
import fs from 'fs';
import multer from 'multer';


dotenv.config();

const upload = multer({ dest: 'uploads/' });

const app = express();
const port = 3000;

const influxDBUrl = 'http://localhost:8086';
const token = 'aflLC2CIRvmQWgF4gGEga-7O3fGEPtEDuTwcYtQtqc_rd1wK-FM9uxH6o_mrRx-lTfs7JuMhzQJxDY1G74rB5A==';
const org = '379932e683da78f5';


// Buckets for Suhu, Kelembapan, and KonsumsiListrik
const suhuBucket = 'dataIotSuhu';
const kelembapanBucket = 'dataIOTKelembapan';
const listrikBucket = 'dataIOTListrik';

const influxDB = new InfluxDB({ url: influxDBUrl, token });

app.use(express.json());
appLogin.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// Helper Function: Query data dari InfluxDB
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

// Endpoint untuk halaman utama login
appLogin.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const jsonToLineProtocol = (jsonData: Record<string, any>[], measurement: string): string => {
  return jsonData
    .map(
      (item) =>
        `${measurement},type=${item.type || 'default'} value=${item.value || 0} ${item.timestamp || Date.now()}`
    )
    .join('\n');
};


// Endpoint to upload JSON file and convert to line protocol
app.post('/upload-json', upload.single('file'), async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const data = fs.readFileSync(file.path, 'utf-8');
    const jsonData = JSON.parse(data);

    const lineProtocol = jsonToLineProtocol(jsonData, 'iot_data');

    const writeApi: WriteApi = influxDB.getWriteApi(org, suhuBucket);
    writeApi.writeRecords(lineProtocol.split('\n'));

    await writeApi.close();

    fs.unlinkSync(file.path);

    res.status(200).send('File uploaded and data written to InfluxDB.');
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file.');
  }
});

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