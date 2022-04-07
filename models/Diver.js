const db = require('../config/connection');

class Diver {
    // Query the DB for all the divers
    getAll() {
        return db.query(`SELECT * FROM divers ORDER BY last_name`);
    }

    // Query the DB for just one diver by their id (prepared statement)
    getOne({ id }) {
        return db.query(
            `SELECT * FROM divers WHERE id = $1`,
            [ id ]
        );
    }

    // Query the DB for the total dives completed by a diver (prepared statement)
    getTotalDives({ id }) {
        return db.query(
            `SELECT COUNT(diver_id) AS number_of_dives
            FROM dives
            WHERE diver_id = $1
            GROUP BY diver_id`,
            [ id ]
        );
    }
}

module.exports = new Diver();