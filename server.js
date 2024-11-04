const express = require('express');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const app = express();
const port = 3000;

// Konfigurasi InfluxDB
const influxDBUrl = 'http://localhost:8086'; // Ganti dengan URL InfluxDB Anda
const token = 'KmPKdqQJBIj74rcPfyrxUEDfXLUqmCdprTUXE4zW7CASCpPYvePHmuUATMCHZeSRhlh4vXdDk_SW0Qx4-kuw7g=='; // Ganti dengan token Anda
const org = '379932e683da78f5'; // Ganti dengan ID organisasi Anda
const bucket = 'dataACIOTLOGGER'; // Ganti dengan nama bucket Anda

const influxDB = new InfluxDB({ url: influxDBUrl, token });

// Middleware untuk mengurai JSON
app.use(express.json());

// Middleware untuk menyajikan file statis dari direktori public
app.use(express.static('public'));

// Endpoint untuk mengambil data
app.get('/data', async (req, res) => {
    const queryApi = influxDB.getQueryApi(org);
    const query = `from(bucket: "${bucket}")
                  |> range(start: 0)`; // Mengambil semua data dari waktu awal

    try {
        const results = [];
        await queryApi.queryRows(query, {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row);
                results.push(o);
            },
            error(error) {
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
});

// Endpoint untuk menghapus data
app.delete('/data', async (req, res) => {
    const deleteApi = influxDB.getDeleteApi(org);
    const start = '1970-01-01T00:00:00Z'; // Awal waktu
    const stop = new Date().toISOString(); // Waktu saat ini

    try {
        await deleteApi.delete({ start, stop, predicate: `sensor_id = "TLM0100"` }, bucket);
        res.send('All data deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting data from InfluxDB');
    }
});

// Mulai server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
