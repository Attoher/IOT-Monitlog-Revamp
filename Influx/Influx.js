const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// Ambil token dari environment variable
const token = process.env.INFLUXDB_TOKEN;
const url = 'http://localhost:8086';

const client = new InfluxDB({ url, token });

let org = `ITS`;
let bucket = `Kel 5`;

let writeClient = client.getWriteApi(org, bucket, 'ns');

// Menulis data ke InfluxDB
for (let i = 0; i < 5; i++) {
    let point = new Point('measurement1')
        .tag('tagname1', 'tagvalue1')
        .intField('field1', i);

    // Menggunakan setTimeout untuk menulis poin secara terpisah dengan interval 1 detik
    setTimeout(() => {
        writeClient.writePoint(point);
        console.log(`Written point: ${i}`);
    }, i * 1000); // pisahkan poin dengan jeda 1 detik
}

// Menyelesaikan penulisan data setelah 5 detik
setTimeout(() => {
    writeClient.flush().then(() => {
        console.log('All points have been written and flushed');
    }).catch(err => {
        console.error('Error flushing points:', err);
    });
}, 5000);
