const db = require('../config/connection');

class Location {
    // Query the DB for ALL locations
    getAll() {
        return db.query(`SELECT * FROM locations ORDER BY name`);
    }

    // Query the DB for a single location (prepared statement)
    getOne({ id }) {
        return db.query(
            `SELECT * FROM locations WHERE id = $1`,
            [ id ]
        );
    }

    // Query the DB for the average dive time for a particular location (prepared statement)
    getAverageTime({ id }) {
        return db.query(
            `SELECT AVG(duration)::INT AS average_duration FROM dives
            WHERE location_id = $1
            GROUP BY location_id`,
            [ id ]
        );
    }

    // Query the DB for the deepest dive performed at a particular location (prepared statement)
    getMaxDepth({ id }) {
        return db.query(
            `SELECT
                CONCAT(divers.first_name, ' ', divers.last_name) AS diver_name,
                dives.depth
            FROM dives
            LEFT JOIN divers ON dives.diver_id = divers.id
            WHERE dives.depth = (
                SELECT MAX(depth)
                FROM dives
                WHERE location_id = $1
            )`,
            [ id ]
        );
    }

    // Query the DB for the most common certification level among all divers at a particular location (prepared statement)
    getCertification({ id }) {
        return db.query(
            `WITH certs AS (
                SELECT DISTINCT dives.diver_id, certifications.name FROM dives
                LEFT JOIN divers ON dives.diver_id = divers.id
                LEFT JOIN certifications ON divers.certification_id = certifications.id
                WHERE dives.location_id = $1
                GROUP BY dives.diver_id, certifications.name
            )
            SELECT name FROM certs
            GROUP BY name
            ORDER BY COUNT(name) DESC LIMIT 1`,
            [ id ]
        );
    }
}

module.exports = new Location();