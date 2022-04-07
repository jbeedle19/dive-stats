require('dotenv').config();

const { Pool, types } = require('pg');

const pool = new Pool();

// This method takes an internal PostgreSQL ID (ex. 20 for the data type returned from COUNT()) and
// returns a new value, in our case either a float or an int
types.setTypeParser(1700, (val) => {
    return parseFloat(val);
});

types.setTypeParser(20, (val) => {
    return parseInt(val);
})

module.exports = {
    query: (text, params) => {
        return pool.query(text, params);
    },
    getClient: () => {
        return pool.connect();
    }
};