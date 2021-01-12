const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { request } = require('express');

port = 3000;

const totalBudget = 1200;
const envelopes = {
    groceries: {
        id: 1,
        budget: '',
    },
    gas: {
        id: 2,
        budget: 300,
    },
    cosmetics: {
        id: 3,
        budget: 300,
    },
    clothing: {
        id: 4,
        budget: '',
    },
    food: {
        id: 5,
        budget: '',
    },
    misc: {
        id: 6,
        budget: '',
    },
}

// app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.send('Hello World!');
})

app.get('/envelopes', (req, res, next) => {
    res.send(envelopes);
})

// will work with JSON name: <name>, budget: <budget>
app.post('/envelopes', (req, res, next) => {
    let finalData = '';
    req.on('data', (data) => {
        finalData += data;
    })
    req.on('end', () => {
        req.body = JSON.parse(finalData);
        let reqBodyKeys = Object.keys(req.body);
        // check if the POST request includes the proper fields
        if (!(reqBodyKeys.includes('name') && reqBodyKeys.includes('budget'))) { return res.sendStatus(400) };
        // console.log(req.body.name);
        // check if the resource requested is created already exists
        if (envelopes[req.body.name]) { return res.send('Resource already exists!') };
        let envelopesArray = Object.keys(envelopes);
        // console.log(envelopesArray)
        let newId = envelopesArray.length + 1;
        req.body.id = newId;
        envelopes[req.body.name] = {
            budget: req.body.budget,
            id: req.body.id,
        };
        res.status(201).send(req.body.name + ' envelope added with ' + req.body.budget + ' as its budget and ' + req.body.id + ' as its id');
    })
})

app.put('/envelopes/:envelopeName', (req, res, next) => {
    let finalData = '';
    req.on('data', (data) => {
        finalData += data;
    })
    req.on('end', () => {
        req.body = JSON.parse(finalData);
        let requestedKeys = Object.keys(req.body);
        // let existingEnvelopes = Object.keys(envelopes);
        // if (!requestedKeys.every(key => envelopes.existingEnvelopes[0].includes(key))) { return res.sendStatus(400) };
        requestedKeys.forEach(key => {
            envelopes[req.params.envelopeName][key] = req.body[key];
        })
        res.send('Resource updated');
    });
});

app.delete('/envelopes/:envelopeName', (req, res, next) => {
    if (Object.keys(envelopes).includes(req.params.envelopeName)) {
        delete envelopes[req.params.envelopeName];
        return res.send('Deleted');
    }
    return res.sendStatus(400);
})

app.get('/envelopes/:envelopeName', (req, res, next) => {
    res.send(envelopes[req.params.envelopeName]);
})

app.post('/envelopes/transfer/:from/:to', (req, res, next) => {
    let finalData = '';
    req.on('data', (data) => {
        finalData += data;
    })
    req.on('end', () => {
        req.body = JSON.parse(finalData);
        if (!Object.keys(req.body).includes('budget')) { return res.sendStatus(400) }
        envelopes[req.params.from].budget -= Number(req.body.budget);
        envelopes[req.params.to].budget += Number(req.body.budget);
        res.send('Transfer performed');
    });
})

app.listen(port, () => {
    console.log('Listening at port:' + port);
})