import "dotenv/config";
import gplay from "google-play-scraper";
import mysql from "mysql2/promise";

const limit = Number(process.argv[2]) || 1;
const scrapReqPS = 10;
const scrapResPS = 1;

const collections = [
    'TOP_FREE',
    'TOP_PAID',
    'GROSSING'
];

const categories = [
    'GAME',
    'GAME_ACTION',
    'GAME_ADVENTURE',
    'GAME_ARCADE',
    'GAME_BOARD',
    'GAME_CARD',
    'GAME_CASINO',
    'GAME_CASUAL',
    'GAME_EDUCATIONAL',
    'GAME_MUSIC',
    'GAME_PUZZLE',
    'GAME_RACING',
    'GAME_ROLE_PLAYING',
    'GAME_SIMULATION',
    'GAME_SPORTS',
    'GAME_STRATEGY',
    'GAME_TRIVIA',
    'GAME_WORD'
];

const games = [];

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME
});

async function fetchAppIds(reqps = 5, resps = 1) {
    let fetchCounter = 0;
    const appIdSet = new Set();

    for (const category of categories) {
        for (const collection of collections) {
            if (collection === 'TOP_PAID' && category === 'GAME_CASINO') {
                continue;
            }

            let res;
            try {
                res = await gplay.list({
                    collection, category,
                    num: limit,
                    throttle: reqps
                });
            } catch (err) {
                console.error(`Fetch failed: ${category} -> ${collection}: ${err.message}`);
                continue;
            }

            fetchCounter += res.length;

            for (const appId of new Set(res.map(g => g.appId))) {
                if (!appIdSet.has(appId)) {
                    appIdSet.add(appId);
                    games.push([appId, currentDateTime()]);
                }
            }

            console.log(`${category} -> ${collection}: ${res.length} games fetched`);

            await new Promise(r => setTimeout(r, 1000 / resps));
        }
    }

    console.log(`Duplicate Fetches: ${fetchCounter - games.length}\nUnique Fetches: ${games.length}`);
}

function currentDateTime() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

async function insertAppIds(games) {
    if (!games.length) return console.log("No games to insert.");

    try {
        const [result] = await pool.query(
            `INSERT INTO games (app_id, modified_at)
            VALUES ?
            ON DUPLICATE KEY UPDATE app_id = app_id`,
            [games]
        );
        console.log(`Inserted Rows: ${result.affectedRows}`);
    } catch (err) {
        console.error(`Insert Failed: ${err.message}`);
    } finally {
        await pool.end();
    }
}

await fetchAppIds(scrapReqPS, scrapResPS);
await insertAppIds(games);
