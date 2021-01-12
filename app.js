const express = require('express');
const envelopes = require('./envelopes');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const connectionString = 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
    connectionString,
});



app.use(morgan('tiny'));
app.use(bodyParser.json());
app.get('/', (request, response) => {
    pool.query('SELECT * FROM envelopes', (err, res) => {
        if (err) throw err;
        console.log(res.rows);
    })
    response.sendStatus(200);
})
app.use('/envelopes', envelopes);

const port = process.argv[2] || 3000;

app.listen(port, () => {
    console.log('Listening at port:' + port);
})