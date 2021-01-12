const express = require('express');
const app = express();
const envelopes = require('./envelopes');
const bodyParser = require('body-parser');
const { request } = require('express');
const morgan = require('morgan');

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use('/envelopes', envelopes);

const port = process.argv[2] || 3000;

app.listen(port, () => {
    console.log('Listening at port:' + port);
})