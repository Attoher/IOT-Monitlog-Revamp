import { Router } from 'express';
import { register, login } from '../controllers/userController';
const { InfluxDB } = require('@influxdata/influxdb-client');
import { Point } from '@influxdata/influxdb-client';

const router = Router();
const token = 'aflLC2CIRvmQWgF4gGEga-7O3fGEPtEDuTwcYtQtqc_rd1wK-FM9uxH6o_mrRx-lTfs7JuMhzQJxDY1G74rB5A==';
const org = '379932e683da78f5';
const suhuBucket = 'dataIotSuhu';
const kelembapanBucket = 'dataIOTKelembapan';
const listrikBucket = 'dataIOTListrik';
const url = 'http://localhost:8086'; // URL InfluxDB

const influxDB = new InfluxDB({ url, token });
const queryApi = influxDB.getQueryApi(org);

router.post('/register', register);
router.post('/login', login);

router.get('/data', async (req, res) => {
  try {
    const queryDataFromBucket = async (
      bucket: string,
      measurement: string
    ): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        const fluxQuery = `
          from(bucket: "${bucket}")
            |> range(start: 0)
            
        `;

        console.log('Running query:', fluxQuery); // Tambahkan debug log
        const rows: any[] = [];
        queryApi.queryRows(fluxQuery, {
          next(row: any, tableMeta: any) {
            const o = tableMeta.toObject(row);
            rows.push(o);
          },
          error(error: any) {
            console.error('Query Error:', error);
            reject(error);
          },
          complete() {
            console.log('Query result:', rows); // Log hasil query
            resolve(rows);
          },
        });
      });
    };

    const [suhuData, kelembapanData, listrikData] = await Promise.all([
      queryDataFromBucket(suhuBucket, 'Suhu'),
      queryDataFromBucket(kelembapanBucket, 'Kelembapan'),
      queryDataFromBucket(listrikBucket, 'KonsumsiListrik'),
    ]);

    console.log('Final response:', {
      suhu: suhuData,
      kelembapan: kelembapanData,
      konsumsiListrik: listrikData,
    });

    res.json({
      suhu: suhuData,
      kelembapan: kelembapanData,
      konsumsiListrik: listrikData,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).send('Unexpected error occurred while fetching data.');
  }
});


// Rute GET untuk mengambil data suhu dari InfluxDB
router.get('/data/suhu', async (req, res) => {
  try {
    const response = await fetch('http://localhost:3000/2analytics.html'); // Sesuaikan dengan endpoint API Anda
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching suhu data.');
  }
});

// Rute GET untuk mengambil data kelembapan dari InfluxDB
router.get('/data/kelembapan', async (req, res) => {
  try {
    const response = await fetch('http://localhost:3000/2analytics.html'); // Sesuaikan dengan endpoint API Anda
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching kelembapan data.');
  }
});

// Rute GET untuk mengambil data konsumsi listrik dari InfluxDB
router.get('/data/konsumsiListrik', async (req, res) => {
  try {
    const response = await fetch('http://localhost:3000/2analytics.html'); // Sesuaikan dengan endpoint API Anda
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching konsumsi listrik data.');
  }
});

interface DataPoint {
  _measurement?: string;
  sensor_id?: string;
  _field: string;
  _value: number;
  _time: string;
}

router.post('/data', async (req, res) => {
  const { suhu, kelembapan, konsumsiListrik } = req.body;

  // Validasi input untuk suhu
  if (suhu && (!Array.isArray(suhu) || !suhu.every((entry: DataPoint) => entry._field && entry._value && entry._time))) {
    return res.status(400).json({
      error: 'Invalid input for suhu. Ensure "suhu" is provided as an array with valid entries (_field, _value, _time).',
    });
  }

  // Validasi input untuk kelembapan
  if (kelembapan && (!Array.isArray(kelembapan) || !kelembapan.every((entry: DataPoint) => entry._field && entry._value && entry._time))) {
    return res.status(400).json({
      error: 'Invalid input for kelembapan. Ensure "kelembapan" is provided as an array with valid entries (_field, _value, _time).',
    });
  }

  // Validasi input untuk konsumsiListrik
  if (konsumsiListrik && (!Array.isArray(konsumsiListrik) || !konsumsiListrik.every((entry: DataPoint) => entry._field && entry._value && entry._time))) {
    return res.status(400).json({
      error: 'Invalid input for konsumsiListrik. Ensure "konsumsiListrik" is provided as an array with valid entries (_field, _value, _time).',
    });
  }

  try {
    // Menulis data suhu ke InfluxDB jika ada
    if (suhu) {
      const writeApiSuhu = influxDB.getWriteApi(org, suhuBucket);
      writeApiSuhu.useDefaultTags({ location: 'office' });

      suhu.forEach((entry: DataPoint) => {
        const point = new Point(entry._measurement || 'Room') // Default measurement
          .tag('sensor_id', entry.sensor_id || 'unknown') // Tambahkan tag
          .floatField(entry._field, entry._value) // Gunakan `floatField` untuk nilai numerik
          .timestamp(new Date(entry._time).getTime() * 1e6); // Konversi timestamp ke nanosecond

        writeApiSuhu.writePoint(point);
      });

      await writeApiSuhu.close();
    }

    // Menulis data kelembapan ke InfluxDB jika ada
    if (kelembapan) {
      const writeApiKelembapan = influxDB.getWriteApi(org, kelembapanBucket);
      writeApiKelembapan.useDefaultTags({ location: 'office' });

      kelembapan.forEach((entry: DataPoint) => {
        const point = new Point(entry._measurement || 'kamarmandi') // Default measurement
          .tag('sensor_id', entry.sensor_id || 'unknown') // Tambahkan tag untuk sensor_id
          .floatField(entry._field, entry._value) // Gunakan `floatField` untuk nilai kelembapan
          .timestamp(new Date(entry._time).getTime() * 1e6); // Konversi timestamp ke nanosecond

        writeApiKelembapan.writePoint(point);
      });

      await writeApiKelembapan.close();
    }

    // Menulis data konsumsiListrik ke InfluxDB jika ada
    if (konsumsiListrik) {
      const writeApiKonsumsiListrik = influxDB.getWriteApi(org, listrikBucket);
      writeApiKonsumsiListrik.useDefaultTags({ location: 'office' });

      konsumsiListrik.forEach((entry: DataPoint) => {
        const point = new Point(entry._measurement || 'ElectricityConsumption') // Default measurement
          .tag('sensor_id', entry.sensor_id || 'unknown') // Tambahkan tag untuk sensor_id
          .floatField(entry._field, entry._value) // Gunakan `floatField` untuk nilai konsumsi listrik
          .timestamp(new Date(entry._time).getTime() * 1e6); // Konversi timestamp ke nanosecond

        writeApiKonsumsiListrik.writePoint(point);
      });

      await writeApiKonsumsiListrik.close();
    }

    res.status(201).json({ message: 'Data written successfully' });
  } catch (error) {
    console.error('Error writing data to InfluxDB:', error);
    res.status(500).json({ error: 'Failed to write data to InfluxDB.' });
  }
});

export default router;
