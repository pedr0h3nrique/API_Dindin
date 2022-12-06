const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 3001,
    user: 'postgres',
    password: 'postgres',
    database: 'dindin',
});

const query = (text, param) => {
    return pool.query(text, param);
};

module.exports = { query }; 