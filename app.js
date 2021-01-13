const express = require('express');
const envelopes = require('./routes/envelopes');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();


app.use(morgan('tiny'));
app.use(bodyParser.json());

app.use('/envelopes', envelopes);

const port = process.argv[2] || 3000;

app.listen(port, () => {
    console.log('Listening at port:' + port);
})