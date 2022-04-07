\c diving_db

-- Query total number of dives that a diver has done
SELECT COUNT(diver_id) AS number_of_dives
FROM dives
WHERE diver_id = 1
GROUP BY diver_id;

-- Query average duration of dives for a particular location
SELECT AVG(duration)::INT AS average_duration
FROM dives
WHERE location_id = 1
GROUP BY location_id;

-- Query the most active month for diving
SELECT DATE_TRUNC('month', dive_date) AS month, COUNT(*) AS dive_count
FROM dives
WHERE dive_date > NOW() - INTERVAL '1 year'
GROUP BY month
ORDER BY dive_count DESC LIMIT 1;

-- Query the deepest dive at a particular location
SELECT CONCAT(divers.first_name, ' ', divers.last_name) AS diver_name, dives.depth
FROM dives
LEFT JOIN divers ON dives.diver_id = divers.id
WHERE dives.depth = (
    SELECT MAX(depth)
    FROM dives
    WHERE location_id = 1
);

-- Query the most common certification level at a given location (using Common Table Expressions)
WITH certs AS (
    SELECT DISTINCT dives.diver_id, certifications.name 
    FROM dives
    LEFT JOIN divers ON dives.diver_id = divers.id
    LEFT JOIN certifications ON divers.certification_id = certifications.id
    WHERE dives.location_id = 1
    GROUP BY dives.diver_id, certifications.name
)
SELECT name FROM certs
GROUP BY name
ORDER BY COUNT(name) DESC LIMIT 1;

-- Use EXPLAIN ANALYZE to inspect queries