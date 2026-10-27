import "dotenv/config";
import gplay from "google-play-scraper";
import pg from "pg";

const { Pool } = pg;

const COUNTRY = "us";
const LANGUAGE = "en";
const RESULTS_PER_LIST = 50;

const collections = [
    { name: "Top free games", value: gplay.collection.TOP_FREE },
    { name: "Top paid games", value: gplay.collection.TOP_PAID },
    { name: "Top grossing games", value: gplay.collection.GROSSING },
];

const gameCategories = Object.keys(gplay.category)
    .filter((name) => name.startsWith("GAME_"))
    .map((name) => ({
        name,
        value: gplay.category[name],
    }));

const pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});

async function fetchAppIds(list) {
    console.log(`Fetching: ${list.name}`);

    try {
        const apps = await gplay.list({
            collection: list.collection,
            category: list.category,
            num: RESULTS_PER_LIST,
            country: COUNTRY,
            lang: LANGUAGE,
        });

        const appIds = apps
            .map((app) => app.appId)
            .filter((appId) => typeof appId === "string" && appId.length > 0);

        console.log(`  Found ${appIds.length} app IDs.`);
        return appIds;
    } catch (error) {
        console.error(`  Failed to fetch "${list.name}": ${error.message}`);
        return [];
    }
}

const allLists = [
    ...collections.map((item) => ({
        name: item.name,
        collection: item.value,
        category: gplay.category.GAME,
    })),
    ...gameCategories.map((item) => ({
        name: item.name,
        collection: gplay.collection.TOP_FREE,
        category: item.value,
    })),
];

console.log("Discovery configuration loaded.");
console.log("Chart collections:", collections.length);
console.log("Game categories:", gameCategories.length);
console.log("Total lists:", allLists.length);

const discoveredAppIds = new Set();

for (const list of allLists) {
    const appIds = await fetchAppIds(list);

    for (const appId of appIds) {
        discoveredAppIds.add(appId);
    }
}

console.log("");
console.log("Google Play discovery completed.");
console.log("Lists processed:", allLists.length);
console.log("Unique app IDs found:", discoveredAppIds.size);

let inserted = 0;
let skipped = 0;

for (const appId of discoveredAppIds) {
    try {
        const result = await pool.query(
            `INSERT INTO games (app_id)
       VALUES ($1)
       ON CONFLICT (app_id) DO NOTHING
       RETURNING id`,
            [appId]
        );

        if (result.rowCount === 1) {
            inserted++;
        } else {
            skipped++;
        }
    } catch (error) {
        console.error(`Failed to insert ${appId}: ${error.message}`);
        await pool.end();
        process.exitCode = 1;
        break;
    }
}

console.log("");
console.log("Database import summary");
console.log("Unique app IDs found:", discoveredAppIds.size);
console.log("Inserted:", inserted);
console.log("Skipped (already stored):", skipped);

await pool.end();
