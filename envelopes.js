const express = require('express');
const router = express.Router();

const envelopesDB = {
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

router.get('/', (req, res, next) => {
    res.send(envelopesDB);
})

// will work with JSON name: <name>, budget: <budget>
router.post('/', (req, res, next) => {
    let reqBodyKeys = Object.keys(req.body);
    // check if the POST request includes the proper fields
    if (!(reqBodyKeys.includes('name') && reqBodyKeys.includes('budget'))) { return res.sendStatus(400) };
    // console.log(req.body.name);
    // check if the resource requested already exists
    if (envelopesDB[req.body.name]) { return res.send('Resource already exists!') };
    let envelopesDBArray = Object.keys(envelopesDB);
    // console.log(envelopesDBArray)
    let newId = envelopesDBArray.length + 1;
    req.body.id = newId;
    envelopesDB[req.body.name] = {
        budget: req.body.budget,
        id: req.body.id,
    };
    res.status(201).send(req.body.name + ' envelope added with ' + req.body.budget + ' as its budget and ' + req.body.id + ' as its id');
})

// should only accept a budget: <budget> format
router.put('/:envelopeName', (req, res, next) => {
    req.body = JSON.parse(finalData);
    let requestedKeys = Object.keys(req.body);
    console.log(requestedKeys[0]);
    if (requestedKeys[0] !== 'budget') return res.sendStatus(400);
    // let existingenvelopesDB = Object.keys(envelopesDB);
    // if (!requestedKeys.every(key => envelopesDB.existingenvelopesDB[0].includes(key))) { return res.sendStatus(400) };
    requestedKeys.forEach(key => {
        envelopesDB[req.params.envelopeName][key] = req.body[key];
    })
    res.send('Resource updated');
});

router.delete('/:envelopeName', (req, res, next) => {
    if (Object.keys(envelopesDB).includes(req.params.envelopeName)) {
        delete envelopesDB[req.params.envelopeName];
        return res.send('Deleted');
    }
    return res.sendStatus(400);
})

router.get('/:envelopeName', (req, res, next) => {
    res.send(envelopesDB[req.params.envelopeName]);
})

router.post('/transfer/:from/:to', (req, res, next) => {
    req.body = JSON.parse(finalData);
    let requestedKeys = Object.keys(req.body);
    if (requestedKeys[0] !== 'budget') return res.sendStatus(400);
    envelopesDB[req.params.from].budget -= Number(req.body.budget);
    envelopesDB[req.params.to].budget += Number(req.body.budget);
    res.send('Transfer performed');
})

module.exports = router;