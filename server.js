const express = require('express');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const sqlite3 = require('sqlite3').verbose();

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

// Inisialisasi koneksi ke database SQLite
const db = new sqlite3.Database('./db.sqlite3');


db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);


app.use(express.json());
app.use(express.static('public'));

// Endpoint untuk suhu data
app.get('/data/suhu', async (req, res) => {
    const queryApi = influxDB.getQueryApi(org);
    const query = `from(bucket: "${suhuBucket}")
                  |> range(start: 0)`; // Adjust range as necessary

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

// Endpoint untuk kelembapan data
app.get('/data/kelembapan', async (req, res) => {
    const queryApi = influxDB.getQueryApi(org);
    const query = `from(bucket: "${kelembapanBucket}")
                  |> range(start: 0)`; // Adjust range as necessary

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

// Endpoint untuk konsumsi listrik data
app.get('/data/konsumsiListrik', async (req, res) => {
    const queryApi = influxDB.getQueryApi(org);
    const query = `from(bucket: "${listrikBucket}")
                  |> range(start: 0)`; // Adjust range as necessary

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

app.post('/signup', (req, res) => {
    const { email, password, firstName, lastName } = req.body;
  
    // Validasi input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Semua field (email, password, first name, last name) harus diisi.' });
    }
  
    // Query untuk menyisipkan data ke tabel users
    const query = `INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)`;
  
    db.run(query, [email, password, firstName, lastName], function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          // Jika email sudah ada
          return res.status(400).json({ error: 'Email sudah terdaftar.' });
        }
        console.error(err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan data.' });
      }
      // Jika berhasil
      res.status(201).json({ message: 'Signup berhasil. Data berhasil disimpan ke database.' });
    });
  });
  

// Endpoint untuk login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email dan password diperlukan' });
    }

    // Query untuk mencari pengguna berdasarkan email dan password
    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;

    db.get(query, [email, password], (err, row) => {
        if (err) {
            console.error('Error executing query', err.message);
            return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
        }

        if (row) {
            // Jika pengguna ditemukan
            return res.json({ message: 'Login berhasil', user: row });
        } else {
            // Jika pengguna tidak ditemukan
            return res.status(401).json({ error: 'Email atau password salah' });
        }
    });
});

  
  app.post('/check-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email diperlukan' });
    }

    try {
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            res.json({ message: 'Email sudah terdaftar' });
        } else {
            res.status(404).json({ message: 'Email belum terdaftar' });
        }
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memeriksa email' });
    }
});


// Endpoint untuk menambahkan data ke SQLite
app.post('/data/sqlite', (req, res) => {
    const { type, value } = req.body;

    if (!type || value === undefined) {
        return res.status(400).json({ error: 'Type and value are required' });
    }

    const query = `INSERT INTO users (type, value) VALUES (?, ?)`;

    db.run(query, [type, value], function (err) {
        if (err) {
            console.error('Error inserting data into SQLite:', err.message);
            return res.status(500).json({ error: 'Failed to insert data' });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Endpoint untuk mengambil semua data dari SQLite
app.get('/data/sqlite', (req, res) => {
    const query = `SELECT * FROM users`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching data from SQLite:', err.message);
            return res.status(500).json({ error: 'Failed to fetch data' });
        }
        res.json(rows);
    });
});

// Endpoint untuk mengambil data dari SQLite berdasarkan jenis sensor
app.get('/data/sqlite/:type', (req, res) => {
    const { type } = req.params;
    const query = `SELECT * FROM users WHERE type = ?`;

    db.all(query, [type], (err, rows) => {
        if (err) {
            console.error('Error fetching data from SQLite:', err.message);
            return res.status(500).json({ error: 'Failed to fetch data' });
        }
        res.json(rows);
    });
});

// Menutup koneksi SQLite saat server dihentikan
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing SQLite connection:', err.message);
        } else {
            console.log('SQLite connection closed.');
        }
        process.exit();
    });
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
