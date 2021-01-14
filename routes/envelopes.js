const express = require('express');
const {pool} = require('../db/config');

const router = express.Router();

/**
   * @swagger
   * definitions:
   *   Envelope:
   *     properties:
   *       id:
   *         type: integer
   *       name:
   *         type: string
   *       budget:
   *         type: integer
   */

/**
 * @swagger
 * /api/envelopes:
 *   get:
 *     tags:
 *       - Envelopes
 *     description: Returns all envelopes
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of envelopes
 *         schema:
 *           $ref: '#/definitions/Envelope'
 */
router.get('/', (req, res, next) => {
    pool.query('SELECT * FROM envelopes', (error, results) => {
        if (error) throw error;
        res.send(results.rows);
    })
})

/**
 * @swagger
 * /api/envelopes:
 *   post:
 *     tags:
 *       - Envelopes
 *     description: Creates a new envelope
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: envelope
 *         description: Envelope object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Envelope'
 *     responses:
 *       200:
 *         description: Successfully created
 */

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

/**
 * @swagger
 * /api/envelopes/:envelopeName:
 *   put:
 *     tags:
 *       - Envelopes
 *     description: Updates the fields of an existing envelope
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: envelope
 *         description: Fields for the Envelope object
 *         in: body
 *         schema:
 *           $ref: '#/definitions/Envelope'
 *     responses:
 *       200:
 *         description: Successfully created
 */

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

/**
 * @swagger
 * /api/envelopes/:envelopeName:
 *   delete:
 *     tags:
 *       - Envelopes
 *     description: Deletes a single envelope
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: envelopeName
 *         description: Envelope's name
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully deleted
 */

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

/**
 * @swagger
 * /api/envelopes/{envelopeName}:
 *   get:
 *     tags:
 *       - Envelopes
 *     description: Returns a single envelope
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: envelopeName
 *         description: Envelope's name
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single envelope
 *         schema:
 *           $ref: '#/definitions/Envelope'
 */

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