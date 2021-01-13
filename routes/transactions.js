const express = require('express');
const {pool} = require('../db/config');

const router = express.Router();

router.get('/', (req, res, next) => {
    pool.query(
        'SELECT * FROM transactions',
        (error, results) => {
            if (error) throw error;
            // results.rows[0].date is a Date instance. changing it to .toDateString()
            results.rows.forEach(result => {
                result.date = result.date.toDateString();
            })
            res.status(200).send(results.rows);
        }
    )
})

router.post('/', (req, res, next) => {
    // check if the POST request includes the proper fields
    if (!(req.body.amount && req.body.recipient && req.body.envelope)) { return res.sendStatus(400) };
    // console.log(req.body.name);
    if (req.body.date) {
        // check for the correct format of the date
        let dateRegex = /(\d{4})-(\d{1,2})-(\d{1,2})/;
        if (!dateRegex.test(req.body.date)) {
            return res.status(400).send('Wrong date format! Use a format of YYYY-MM-DD');
        }
        let match = dateRegex.exec(req.body.date).slice(1, 4);
        if (match[1] > 12 || match[2] > 31) {
            return res.status(400).send('Wrong date format! Use a format of YYYY-MM-DD');
        }
        pool.query(
            'INSERT INTO transactions (date, amount, recipient, envelope_name) values ($1, $2, $3, $4)', 
            [req.body.date, req.body.amount, req.body.recipient, req.body.envelope], 
            (error) => {
                if (error) {
                    if (error.code === '23503') return res.status(400).send('Envelope does not exist!');
                    throw error;
                }
                res.sendStatus(201);
            }
        )
    } else {
        pool.query(
            'INSERT INTO transactions (amount, recipient, envelope_name) values ($1, $2, $3)', 
            [req.body.amount, req.body.recipient, req.body.envelope], 
            (error) => {
                if (error) {
                    if (error.code === '23503') return res.status(400).send('Envelope does not exist!');
                    throw error;
                }
                res.sendStatus(201);
            }
        )
    }
})

router.put('/', (req, res, next) => {
    
})

router.delete('/', (req, res, next) => {
    
})

module.exports = router;