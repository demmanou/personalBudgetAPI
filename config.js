const { Pool } = require('pg');
require('dotenv').config();

const connectionString = 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
    connectionString,
});

module.exports = {pool};