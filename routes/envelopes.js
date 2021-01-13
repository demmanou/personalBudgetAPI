const express = require('express');
const {pool} = require('../db/config');

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
    pool.query(
        'INSERT INTO envelopes (name, budget) values ($1, $2)', 
        [req.body.name, req.body.budget], 
        (error) => {
            // check if the SQL statement throws an error when the name already exists (name has unique constraint)
            if (error) {
                if (error.code === '23505') return res.status(409).send('Resource already exists!');
                throw error;
            }
            // if (envelopesDB[req.body.name]) { return res.send('Resource already exists!') };
            res.status(201).send(req.body.name + ' envelope added with ' + req.body.budget + ' as its budget');
        }
    )
})

// should only accept a budget: <budget> format
router.put('/:envelopeName', (req, res, next) => {
    if (!req.body.budget) return res.sendStatus(400);
    pool.query(
        'SELECT * FROM envelopes WHERE name=$1',
        [req.params.envelopeName],
        (error, results) => {
            if (error) throw error;
            // if resource not found 404
            if (!results.rows.length) return res.sendStatus(404);
            pool.query(
                'UPDATE envelopes SET budget=$1 WHERE name=$2',
                [req.body.budget, req.params.envelopeName],
                (error, results) => {
                    if (error) throw error;
                    res.sendStatus(204);
                }
            )
        }
    );
});

router.delete('/:envelopeName', (req, res, next) => {
    pool.query(
        'SELECT * FROM envelopes WHERE name=$1',
        [req.params.envelopeName],
        (error, results) => {
            if (error) throw error;
            // if resource not found 404
            if (!results.rows.length) return res.sendStatus(404);
            pool.query(
                'DELETE FROM envelopes WHERE name=$1',
                [req.params.envelopeName],
                (error, results) => {
                    if (error) throw error;
                    res.sendStatus(204);
                }
            )
        }
    );
})

router.get('/:envelopeName', (req, res, next) => {
    pool.query(
        'SELECT * FROM envelopes WHERE name=$1',
        [req.params.envelopeName],
        (error, results) => {
            if (error) throw error;
            // if resource not found 404
            if (!results.rows.length) return res.sendStatus(404);
            pool.query(
                'SELECT * FROM envelopes WHERE name=$1',
                [req.params.envelopeName],
                (error, results) => {
                    if (error) throw error;
                    res.status(200).send(results.rows);
                }
            )
        }
    );
})

router.post('/transfer/:from/:to', (req, res, next) => {
    // check if the POST request includes the proper fields
    if (!req.body.budget) { return res.sendStatus(400) };
    // check if the resources requested  exist
    console.log(req.params.from, req.params.to);
    pool.query(
        'SELECT name FROM envelopes WHERE name=$1 OR name=$2',
        [req.params.from, req.params.to],
        (error, results) => {
            if (error) throw error;
            if (results.rows.length !== 2) {
                return res.status(404).send('Didn\t find requested resources');
            }
            pool.query(
                'SELECT budget FROM envelopes WHERE name=$1 OR name=$2', 
                [req.params.from, req.params.to], 
                (error, results) => {
                    if (error) throw error;
                    // console.log(results);
                    // if (envelopesDB[req.body.name]) { return res.send('Resource already exists!') };
                    pool.query(
                        'UPDATE envelopes SET budget=$1 WHERE name=$2',
                        [results.rows[0].budget - req.body.budget, req.params.from],
                        (error) => {
                            if (error) throw error;
                            pool.query(
                                'UPDATE envelopes SET budget=$1 WHERE name=$2',
                                [results.rows[1].budget + req.body.budget, req.params.to],
                                (error) => {
                                    if (error) throw error;
                                    res.sendStatus(200);
                                }
                            )
                        }
                    )
                }
            )
        }
    )
})

module.exports = router;