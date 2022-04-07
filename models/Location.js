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

    // Query the DB to add a new location and return the location info (prepared statement)
    // If we add a brand new tag then the Tags table will also need to be updated
    // We use getClient here because we are making a transaction and it is not safe to do one in just a normal pool.query
    create({ name, lat, long, tags }) {
        return new Promise(async (resolve, reject) => {
            const client = await db.getClient();

            try {
                await client.query('BEGIN');

                const results = await client.query(
                    `INSERT INTO locations (name, coordinates)
                    VALUES ($1, POINT($2, $3))
                    RETURNING *`,
                    [ name, lat, long ]
                );

                if (tags && tags.length > 0) {
                    for (const tag of tags) {
                        await client.query(
                            `INSERT INTO tags (name, location_id)
                            VALUES ($1, $2)`,
                            [ tag, results.rows[0].id ]
                        )
                    }
                }
                
                await client.query('COMMIT');
                resolve(results);
            } catch (err) {
                await client.query('ROLLBACK');
                reject(err);
            }

            client.release();
        });
    }
}

module.exports = new Location();