const express = require('express');
const envelopes = require('./routes/envelopes');
const transactions = require('./routes/transactions');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');

const port = process.argv[2] || 3000;
const app = express();

// swagger definition
const swaggerDefinition = {
    info: {
      title: 'Node Swagger API',
      version: '1.0.0',
      description: 'Demonstrating how to describe a RESTful API with Swagger',
    },
    host: 'localhost:' + port,
    basePath: '/api',
};
  
  // options for the swagger docs
const options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./routes/*.js'],
};
  
  // initialize swagger-jsdoc
const swaggerSpec = swaggerJsDoc(options);

app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use(morgan('tiny'));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use('/api/envelopes', envelopes);
app.use('/api/transactions', transactions);

app.listen(port, () => {
    console.log('Listening at port:' + port);
})