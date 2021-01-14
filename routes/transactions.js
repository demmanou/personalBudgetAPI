const express = require('express');
const {pool} = require('../db/config');

const router = express.Router();

const isDateFormatValid = function(requestDate) {
    // check for the correct format of the date
    let dateRegex = /(\d{4})-(\d{1,2})-(\d{1,2})/;
    if (!dateRegex.test(requestDate)) {
        return false;
    }
    // .exec will return an array. first item is the entire match. next ones are the matches one by one (there's more - not used here)
    let match = dateRegex.exec(requestDate).slice(1, 4);
    if (match[1] > 12 || match[2] > 31) {
        return false;
    }
    return true;
}

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

router.get('/:transactionId', (req, res, next) => {
    pool.query(
        'SELECT * FROM transactions WHERE id=$1',
        [req.params.transactionId],
        (error, results) => {
            if (error) {
                throw error;
            }
            if (results.rows.length === 0) return res.status(404).send('Incorrect transaction ID!');
            results.rows.forEach(result => {
                result.date = result.date.toDateString();
            })
            res.status(200).send(results.rows);
        }
    )
})

router.post('/', (req, res, next) => {
    // check if the POST request includes the proper fields
    if (!(req.body.amount && req.body.recipient && req.body.envelope)) { 
        return res.sendStatus(400) 
    };
    // date will be automatically entered if missing from the entry
    if (req.body.date) {
        // check for the correct format of the date
        if (isDateFormatValid(req.body.date)) {
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
            return res.status(400).send('Wrong date format! Use a format of YYYY-MM-DD');
        }
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

// need to add logic to check which arguments were passed and need to be updated for the requested transactionId
router.put('/:transactionId', (req, res, next) => {
    // check if request includes at least one of the right fields
    if (!(req.body.date || req.body.amount || req.body.recipient || req.body.envelope)) { return res.sendStatus(400) };
    // if there exists a date field 
    if (req.body.date) {
        // check if the date is in the right format
        if (isDateFormatValid(req.body.date)) {
            pool.query(
                'SELECT * FROM transactions WHERE id=$1',
                [req.params.transactionId],
                (error, results) => {
                    if (error) throw error;
                    let transaction = {
                        id: req.params.transactionId,
                        date: results.rows[0].date,
                        amount: results.rows[0].amount,
                        recipient: results.rows[0].recipient,
                        envelope_name: results.rows[0].envelope_name
                    }
                    pool.query(
                        'UPDATE transactions SET date=$1, amount=$2, recipient=$3, envelope_name=$4 WHERE id=$5', 
                        [req.body.date || transaction.date, 
                            req.body.amount || transaction.amount, 
                            req.body.recipient || transaction.recipient, 
                            req.body.envelope || transaction.envelope_name,
                            transaction.id], 
                        (error) => {
                            if (error) {
                                if (error.code === '23503') return res.status(400).send('Envelope does not exist!');
                                throw error;
                            }
                            res.sendStatus(201);
                        }
                    )
                }
            )
        } else {
            return res.status(400).send('Wrong date format! Use a format of YYYY-MM-DD');
        }
    } else {
        pool.query(
            'SELECT * FROM transactions WHERE id=$1',
            [req.params.transactionId],
            (error, results) => {
                if (error) throw error;
                let transaction = {
                    id: req.params.transactionId,
                    date: results.rows[0].date,
                    amount: results.rows[0].amount,
                    recipient: results.rows[0].recipient,
                    envelope_name: results.rows[0].envelope_name
                }
                pool.query(
                    'UPDATE transactions SET date=$1, amount=$2, recipient=$3, envelope_name=$4 WHERE id=$5', 
                    [req.body.date || transaction.date, 
                        req.body.amount || transaction.amount, 
                        req.body.recipient || transaction.recipient, 
                        req.body.envelope || transaction.envelope_name,
                        transaction.id], 
                    (error) => {
                        if (error) {
                            if (error.code === '23503') return res.status(400).send('Envelope does not exist!');
                            throw error;
                        }
                        res.sendStatus(201);
                    }
                )
            }
        )
    }
})

router.delete('/:transactionId', (req, res, next) => {
    pool.query(
        'SELECT * FROM transactions WHERE id=$1',
        [req.params.transactionId],
        (error, results) => {
            if (error) throw error;
            // if resource not found 404
            if (!results.rows.length) return res.sendStatus(404);
            pool.query(
                'DELETE FROM transactions WHERE id=$1',
                [req.params.transactionId],
                (error, results) => {
                    if (error) throw error;
                    res.sendStatus(204);
                }
            )
        }
    );
})

module.exports = router;