const express = require('express');
const {pool} = require('./config');

const router = express.Router();

router.get('/', (req, res, next) => {
    pool.query('SELECT * FROM envelopes', (error, results) => {
        if (error) throw error;
        res.send(results.rows);
    })
})

// will work with JSON name: <name>, budget: <budget>
router.post('/', (req, res, next) => {
    // check if the POST request includes the proper fields
    if (!(req.body.name && req.body.budget)) { return res.sendStatus(400) };
    // console.log(req.body.name);
    // check if the resource requested already exists
    pool.query(
        'SELECT name FROM envelopes WHERE name=$1 limit 1',
        [req.body.name],
        (error, results) => {
            if (error) throw error;
            if (results.rows.length) {
                return res.send('Resource already exists!');
            }
            pool.query(
                'INSERT INTO envelopes (name, budget) values ($1, $2)', 
                [req.body.name, req.body.budget], 
                (error) => {
                    if (error) throw error;
                    // if (envelopesDB[req.body.name]) { return res.send('Resource already exists!') };
                    res.status(201).send(req.body.name + ' envelope added with ' + req.body.budget + ' as its budget');
                }
            )
        }
    )
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