import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

const limit = `LIMIT 10`;

const ALLOWED_KEYS = [
    "sortBy",
    "games.free =",
    "games.offers_iap =",
    "games.ad_supported =",
    "games.android_version <=",
    "games.max_installs <=",
    "games.max_installs >=",
    "games.score <=",
    "games.score >=",
    "games.price <=",
    "games.price >=",
    "games.ratings <=",
    "games.ratings >=",
    "games.reviews <=",
    "games.reviews >=",
    "games.updated <=",
    "games.updated >=",
    "games.released <=",
    "games.released >=",
    "genres.genre IN",
    "oneOfTags",
    "allOfTags"
];

const DEFAULT_SORT = "games.max_installs DESC";
const ALLOWED_SORTS = [
    "games.max_installs ASC",
    "games.max_installs DESC",
    "games.score ASC",
    "games.score DESC",
    "games.ratings ASC",
    "games.ratings DESC",
    "games.reviews ASC",
    "games.reviews DESC",
    "games.price ASC",
    "games.price DESC",
    "games.android_version ASC",
    "games.android_version DESC",
    "games.updated ASC",
    "games.updated DESC",
    "games.released ASC",
    "games.released DESC"
];

router.get('/', async (req, res) => {
    const { sortBy, ...filters } = req.query;

    const conditions = [];
    const values = [];

    for (const [key, value] of Object.entries(filters)) {
        if (!ALLOWED_KEYS.includes(key)) continue;

        const normV = normalizeValue(key, value);
        if (normV === null) continue;

        if (key === "genres.genre IN") {
            conditions.push(`${key} (?)`);
            values.push(normV);
        } else if (key === "oneOfTags") {
            conditions.push(`
                EXISTS (
                    SELECT 1
                    FROM games_tags
                    JOIN tags ON games_tags.tag_id = tags.id
                    WHERE games_tags.game_id = games.id
                        AND tags.tag IN (?)
                )`);
            values.push(normV);
        } else if (key === "allOfTags") {
            conditions.push(`
                (
                    SELECT COUNT(DISTINCT tags.tag)
                    FROM games_tags
                    JOIN tags ON games_tags.tag_id = tags.id
                    WHERE games_tags.game_id = games.id
                        AND tags.tag IN (?)
                ) = ?`);
            values.push(normV);
            values.push(normV.length);
        } else {
            conditions.push(`${key} ?`);
            values.push(normV);
        }
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let order = `ORDER BY ${DEFAULT_SORT}`;
    if (sortBy && ALLOWED_SORTS.includes(sortBy)) {
        order = `ORDER BY ${sortBy}`;
    }

    const sql = `
        SELECT
            games.*,
            JSON_OBJECT(
                'id', genres.id,
                'name', genres.genre
            ) AS genre,
            JSON_OBJECT(
                'id', developers.id,
                'dev_id', developers.developer_id,
                'website', developers.developer_website,
                'name', developers.developer
            ) AS developer,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', tags.id,
                        'name', tags.tag
                    )
                )
                FROM games_tags
                LEFT JOIN tags ON games_tags.tag_id = tags.id
                WHERE games_tags.game_id = games.id
            ) AS tags
        FROM games
        LEFT JOIN genres ON games.genre_id = genres.id
        LEFT JOIN developers ON games.developer_id = developers.id
        ${where}
        ${order}
        ${limit}
    `.replace(/\s+/g, ' ').trim();

    try {
        const [rows] = await pool.query(sql, values);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

function normalizeValue(condition, value) {
    switch (condition) {
        case "games.free =":
        case "games.offers_iap =":
        case "games.ad_supported =":
            return normalizeValueBool();
        case "games.android_version <=":
            return normalizeValueNumber(0, 99.99, 2);
        case "games.max_installs <=":
        case "games.max_installs >=":
            return normalizeValueNumber(0, 100_000_000_000, 0);
        case "games.score <=":
        case "games.score >=":
            return normalizeValueNumber(0, 5, 3);
        case "games.price <=":
        case "games.price >=":
            return normalizeValueNumber(0, 999.99, 2);
        case "games.ratings <=":
        case "games.ratings >=":
        case "games.reviews <=":
        case "games.reviews >=":
            return normalizeValueNumber(0, 10_000_000_000, 0);
        case "games.updated <=":
        case "games.updated >=":
        case "games.released <=":
        case "games.released >=":
            return normalizeValueDate();
        case "genres.genre IN":
        case "oneOfTags":
        case "allOfTags":
            return normalizeValueArray();
        default:
            return null;
    }

    function normalizeValueBool() {
        if (value === "true") return true;
        if (value === "false") return false;
        return null;
    }

    function normalizeValueNumber(min = 0, max = 99.99, fixed = 2) {
        if (value === null || typeof value !== "string" || value.trim() === "") return null;
        const parsed = Number(value);

        if (isNaN(parsed) || parsed < min || parsed > max) return null;
        return Math.trunc(parsed * 10 ** fixed) / 10 ** fixed;
    }

    function normalizeValueDate() {
        if (value === undefined || value === null) return null;
        const dtString = new Date(value);
        if (isNaN(dtString)) return null;
        return dtString.toISOString().slice(0, 10)
    }

    function normalizeValueArray() {
        let resultArray = [];
        if (typeof value === 'string') {
            resultArray = value.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (Array.isArray(value)) {
            resultArray = value;
        }
        return (resultArray.length !== 0) ? resultArray : null;
    }
}

export default router;
