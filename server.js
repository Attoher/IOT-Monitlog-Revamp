const express = require('express');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const app = express();
const port = 3000;


const influxDBUrl = 'http://localhost:8086';
const token = 'HWcPWyM5YSa9atjk-OjDTmFAfjvrj962jj7EQcdH7dWqg81wGM55bGizVZwxXJWoOzA97kZt85tMKXv3JzsXuQ=='; 
const org = '06894bea11cc3250'; 
const bucket = 'dataIotSuhu'; 

const influxDB = new InfluxDB({ url: influxDBUrl, token });

app.use(express.json());


app.use(express.static('public'));


app.get('/data', async (req, res) => {
    const queryApi = influxDB.getQueryApi(org);
    const query = `from(bucket: "${bucket}")
                  |> range(start: 0)`; 

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


app.delete('/data', async (req, res) => {
    const deleteApi = influxDB.getDeleteApi(org);
    const start = '1970-01-01T00:00:00Z'; 
    const stop = new Date().toISOString(); 

    try {
        await deleteApi.delete({ start, stop, predicate: `sensor_id = "TLM0100"` }, bucket);
        res.send('All data deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting data from InfluxDB');
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
