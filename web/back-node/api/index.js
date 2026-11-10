import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

const limit = `LIMIT 10`;

// TODO: add[genre, tags]
const ALLOWED_KEYS = [
    "sortBy",
    "free =",
    "offers_iap =",
    "ad_supported =",
    "android_version <=",
    "max_installs <=",
    "max_installs >=",
    "score <=",
    "score >=",
    "price <=",
    "price >=",
    "ratings <=",
    "ratings >=",
    "reviews <=",
    "reviews >=",
    "updated <=",
    "updated >=",
    "released <=",
    "released >="
];

const DEFAULT_SORT = "max_installs DESC";
const ALLOWED_SORTS = [
    "max_installs ASC",
    "max_installs DESC",
    "score ASC",
    "score DESC",
    "ratings ASC",
    "ratings DESC",
    "reviews ASC",
    "reviews DESC",
    "price ASC",
    "price DESC",
    "android_version ASC",
    "android_version DESC",
    "updated ASC",
    "updated DESC",
    "released ASC",
    "released DESC",
];

router.get('/', async (req, res) => {
    const { sortBy, ...filters } = req.query;

    const conditions = [];
    const values = [];

    for (const [key, value] of Object.entries(filters)) {
        if (!ALLOWED_KEYS.includes(key)) continue;

        const normV = normalizeValue(key, value);
        if (normV === null) continue;

        conditions.push(`${key} ?`);
        values.push(normV);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let order = `ORDER BY ${DEFAULT_SORT}`;
    if (sortBy && ALLOWED_SORTS.includes(sortBy)) {
        order = `ORDER BY ${sortBy}`;
    }

    const sql = `SELECT * FROM games ${where} ${order} ${limit}`.trim();

    try {
        const [rows] = await pool.execute(sql, values);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

function normalizeValue(condition, value) {
    switch (condition) {
        case "free =":
        case "offers_iap =":
        case "ad_supported =":
            return normalizeValueBool();
        case "android_version <=":
            return normalizeValueNumber(0, 99.99, 2);
        case "max_installs <=":
        case "max_installs >=":
            return normalizeValueNumber(0, 100_000_000_000, 0);
        case "score <=":
        case "score >=":
            return normalizeValueNumber(0, 5, 3);
        case "price <=":
        case "price >=":
            return normalizeValueNumber(0, 999.99, 2);
        case "ratings <=":
        case "ratings >=":
        case "reviews <=":
        case "reviews >=":
            return normalizeValueNumber(0, 10_000_000_000, 0);
        case "updated <=":
        case "updated >=":
        case "released <=":
        case "released >=":
            return normalizeValueDate();
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
}

export default router;
