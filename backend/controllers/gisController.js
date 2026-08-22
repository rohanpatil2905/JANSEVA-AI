// controllers/gisController.js
// GIS endpoints: hotspot clustering, "complaints near me", and raw points for
// a heatmap layer. No PostGIS dependency — uses plain lat/long with a
// grid-bucket approach for clustering and the haversine formula (in SQL) for
// radius search, so it runs against any vanilla Postgres instance.

const pool = require('../db/pool');

// Shared WHERE-clause builder so all three endpoints support the same filters.
function buildFilters({ status, department_id, category_id, from, to }, startIndex = 1) {
    const conditions = ['latitude IS NOT NULL', 'longitude IS NOT NULL'];
    const values = [];
    let i = startIndex;

    if (status) {
        conditions.push(`status = $${i++}`);
        values.push(status);
    }
    if (department_id) {
        conditions.push(`department_id = $${i++}`);
        values.push(department_id);
    }
    if (category_id) {
        conditions.push(`category_id = $${i++}`);
        values.push(category_id);
    }
    if (from) {
        conditions.push(`created_at >= $${i++}`);
        values.push(from);
    }
    if (to) {
        conditions.push(`created_at <= $${i++}`);
        values.push(to);
    }

    return { whereClause: conditions.join(' AND '), values, nextIndex: i };
}

// GET /api/gis/hotspots?precision=3&status=&department_id=&category_id=&from=&to=
// Buckets complaints into a lat/long grid (precision = decimal places, so
// 1 ~= 11km cells, 2 ~= 1.1km, 3 ~= 110m, 4 ~= 11m) and returns each
// non-empty cell as a cluster: center point, complaint count, average
// severity (if scored), and the dominant status/category in that cell.
// This is what the officer dashboard's map view is meant to call.
async function getHotspots(req, res) {
    try {
        let precision = parseInt(req.query.precision, 10);
        if (!Number.isInteger(precision) || precision < 1 || precision > 6) precision = 3;

        const { whereClause, values } = buildFilters(req.query);

        const result = await pool.query(
            `WITH bucketed AS (
                SELECT
                    c.id,
                    c.status,
                    c.category_id,
                    ROUND(c.latitude::numeric, $${values.length + 1}) AS lat_bucket,
                    ROUND(c.longitude::numeric, $${values.length + 1}) AS lng_bucket,
                    c.latitude,
                    c.longitude,
                    s.final_score
                FROM complaints c
                LEFT JOIN LATERAL (
                    SELECT final_score FROM severity_scores
                    WHERE complaint_id = c.id ORDER BY created_at DESC LIMIT 1
                ) s ON true
                WHERE ${whereClause}
            )
            SELECT
                lat_bucket,
                lng_bucket,
                COUNT(*)::int AS complaint_count,
                AVG(latitude)::float AS center_lat,
                AVG(longitude)::float AS center_lng,
                ROUND(AVG(final_score)::numeric, 2) AS avg_severity,
                MODE() WITHIN GROUP (ORDER BY status) AS dominant_status,
                array_agg(DISTINCT category_id) FILTER (WHERE category_id IS NOT NULL) AS category_ids,
                array_agg(id) AS complaint_ids
            FROM bucketed
            GROUP BY lat_bucket, lng_bucket
            ORDER BY complaint_count DESC`,
            [...values, precision]
        );

        const merged = mergeAdjacentClusters(result.rows, precision);

        return res.json({
            precision,
            hotspot_count: merged.length,
            hotspots: merged,
        });
    } catch (err) {
        console.error('getHotspots error:', err);
        return res.status(500).json({ error: 'Something went wrong while computing hotspots' });
    }
}

// Grid bucketing has a known edge effect: two complaints a few metres apart
// can land in adjacent cells if they straddle a rounding boundary, which
// would otherwise fragment one real-world hotspot into two map pins. This
// does a second, distance-based merge pass over the (typically small) list
// of bucket rows: greedily absorb any bucket whose center is within one
// cell-width of another bucket's center, combining counts/severity/members.
function mergeAdjacentClusters(rows, precision) {
    const cellDegrees = Math.pow(10, -precision); // e.g. precision=3 -> 0.001
    // Rough meters-per-degree-latitude conversion for the merge threshold.
    const mergeRadiusMeters = cellDegrees * 111000 * 1.5;

    const haversine = (lat1, lng1, lat2, lng2) => {
        const R = 6371000;
        const toRad = (d) => (d * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(a));
    };

    const remaining = rows.map((r) => ({ ...r, _merged: false }));
    const clusters = [];

    for (let i = 0; i < remaining.length; i++) {
        if (remaining[i]._merged) continue;
        const group = [remaining[i]];
        remaining[i]._merged = true;

        for (let j = i + 1; j < remaining.length; j++) {
            if (remaining[j]._merged) continue;
            const dist = haversine(
                remaining[i].center_lat, remaining[i].center_lng,
                remaining[j].center_lat, remaining[j].center_lng
            );
            if (dist <= mergeRadiusMeters) {
                group.push(remaining[j]);
                remaining[j]._merged = true;
            }
        }

        const totalCount = group.reduce((sum, g) => sum + g.complaint_count, 0);
        const weightedLat = group.reduce((sum, g) => sum + g.center_lat * g.complaint_count, 0) / totalCount;
        const weightedLng = group.reduce((sum, g) => sum + g.center_lng * g.complaint_count, 0) / totalCount;
        const severities = group.filter((g) => g.avg_severity !== null).map((g) => Number(g.avg_severity));
        const allIds = group.flatMap((g) => g.complaint_ids);
        const statusCounts = {};
        group.forEach((g) => {
            statusCounts[g.dominant_status] = (statusCounts[g.dominant_status] || 0) + g.complaint_count;
        });
        const dominantStatus = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0][0];

        clusters.push({
            center_lat: weightedLat,
            center_lng: weightedLng,
            complaint_count: totalCount,
            avg_severity: severities.length
                ? Math.round((severities.reduce((a, b) => a + b, 0) / severities.length) * 100) / 100
                : null,
            dominant_status: dominantStatus,
            complaint_ids: allIds,
        });
    }

    return clusters.sort((a, b) => b.complaint_count - a.complaint_count);
}

// GET /api/gis/points?status=&department_id=&category_id=&from=&to=&limit=2000
// Raw (unclustered) lat/long + severity for every matching complaint, capped
// by `limit`. Meant for a client-side heatmap library (e.g. Leaflet.heat)
// that does its own density rendering — the server just filters and caps.
async function getHeatmapPoints(req, res) {
    try {
        let limit = parseInt(req.query.limit, 10);
        if (!Number.isInteger(limit) || limit < 1 || limit > 5000) limit = 2000;

        const { whereClause, values, nextIndex } = buildFilters(req.query);

        const result = await pool.query(
            `SELECT c.id, c.latitude, c.longitude, c.status, c.category_id, c.created_at,
                    s.final_score, s.priority_label
             FROM complaints c
             LEFT JOIN LATERAL (
                 SELECT final_score, priority_label FROM severity_scores
                 WHERE complaint_id = c.id ORDER BY created_at DESC LIMIT 1
             ) s ON true
             WHERE ${whereClause}
             ORDER BY c.created_at DESC
             LIMIT $${nextIndex}`,
            [...values, limit]
        );

        return res.json({ point_count: result.rows.length, points: result.rows });
    } catch (err) {
        console.error('getHeatmapPoints error:', err);
        return res.status(500).json({ error: 'Something went wrong while fetching heatmap points' });
    }
}

// GET /api/gis/nearby?lat=..&lng=..&radius_meters=500&limit=20&status=&department_id=&category_id=
// Complaints within radius_meters of a point, sorted nearest-first. Useful
// both for officers investigating an area and for the citizen-facing
// "similar complaints already reported near you" prompt at submission time.
async function getNearby(req, res) {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        let radius = parseFloat(req.query.radius_meters);
        let limit = parseInt(req.query.limit, 10);

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
            return res.status(400).json({ error: 'lat and lng query params are required' });
        }
        if (!Number.isFinite(radius) || radius <= 0) radius = 500;
        if (!Number.isInteger(limit) || limit < 1 || limit > 200) limit = 20;

        // Rough bounding-box pre-filter (cheap, index-friendly) before the
        // exact haversine distance calc — avoids scanning the whole table.
        const latDelta = radius / 111000; // ~111km per degree latitude
        const lngDelta = radius / (111000 * Math.cos((lat * Math.PI) / 180) || 1);

        const { whereClause, values, nextIndex } = buildFilters(req.query, 7);

        const result = await pool.query(
            `SELECT c.id, c.title, c.status, c.category_id, c.latitude, c.longitude, c.created_at,
                    ( 6371000 * acos(
                        LEAST(1.0, GREATEST(-1.0,
                            cos(radians($1)) * cos(radians(c.latitude)) *
                            cos(radians(c.longitude) - radians($2)) +
                            sin(radians($1)) * sin(radians(c.latitude))
                        ))
                    ) ) AS distance_meters
             FROM complaints c
             WHERE c.latitude BETWEEN $3 AND $4
               AND c.longitude BETWEEN $5 AND $6
               AND ${whereClause}
             ORDER BY distance_meters ASC
             LIMIT $${nextIndex}`,
            [lat, lng, lat - latDelta, lat + latDelta, lng - lngDelta, lng + lngDelta, ...values, limit]
        );

        const withinRadius = result.rows.filter((r) => r.distance_meters <= radius);

        return res.json({
            center: { lat, lng },
            radius_meters: radius,
            result_count: withinRadius.length,
            complaints: withinRadius,
        });
    } catch (err) {
        console.error('getNearby error:', err);
        return res.status(500).json({ error: 'Something went wrong while searching nearby complaints' });
    }
}

module.exports = { getHotspots, getHeatmapPoints, getNearby };
