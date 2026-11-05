import "dotenv/config";
import gplay from "google-play-scraper";
import mysql from "mysql2/promise";

const toDo = process.argv[2] || "fill";
const limit = Number(process.argv[3]) || 1;
const reqps = 2;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    flags: '-FOUND_ROWS'
});

// array of objects
let games = [];

async function fillNullRows() {
    [games] = await pool.query(
        `SELECT id, app_id
        FROM games
        WHERE (
            title IS NULL OR
            summary IS NULL OR
            description_html IS NULL OR
            max_installs IS NULL OR
            score IS NULL OR
            ratings IS NULL OR
            reviews IS NULL OR
            price IS NULL OR
            free IS NULL OR
            ad_supported IS NULL OR
            offers_iap IS NULL OR
            android_version IS NULL OR
            screenshots IS NULL OR
            icon IS NULL OR
            header_image IS NULL OR
            url IS NULL OR
            developer_id IS NULL OR
            genre_id IS NULL OR
            updated IS NULL OR
            released IS NULL
        )
        ORDER BY modified_at ASC
        LIMIT ?`,
        [limit]
    );

    if (games.length == 0) return console.log("All rows are filled");

    updateRows();
}

async function syncOldRows() {
    [games] = await pool.query(
        `SELECT id, app_id
        FROM games
        ORDER BY modified_at ASC
        LIMIT ?`,
        [limit]
    );

    updateRows();
}

async function updateRows() {
    async function fetchApps() {
        const out = {};
        let req = 1;

        for (const game of games) {
            const { id, app_id } = game;

            try {
                const app = await gplay.app({ appId: app_id });

                out[app_id] = await normalizeApp(app, id, app_id);
            } catch (e) {
                console.error(`fetch failed for ${app_id}:`, e.message);
            }

            process.stdout.write(`\rProgress: ${(100 * req / games.length).toFixed(2)}%`);
            req++

            await new Promise(r => setTimeout(r, 1000 / reqps));
        }
        return out;
    }

    async function normalizeApp(app, id, app_id) {
        await setTags(id, app.categories, app_id);

        return {
            ...app,

            id: id,
            app_id: app_id,
            modified_at: dateTime(),
            title: app.title ?? null,
            summary: app.summary ?? null,
            description_html: app.descriptionHTML ?? null,
            max_installs: app.maxInstalls ?? null,
            score: app.score ?? null,
            ratings: app.ratings ?? null,
            reviews: app.reviews ?? null,
            price: app.price ?? null,
            free: app.free ?? null,
            ad_supported: app.adSupported ?? null,
            offers_iap: app.offersIAP ?? null,
            android_version: parseAndroidVersion(app.androidVersion),
            screenshots: app.screenshots ? JSON.stringify(app.screenshots) : null,
            icon: app.icon ?? null,
            header_image: app.headerImage ?? null,
            url: app.url ?? null,
            developer_id: await getDeveloperId(
                app.developerId,
                app.developerWebsite,
                app.developer
            ),
            genre_id: await getGenreId(app.genre),
            updated: app.updated ? dateTime(app.updated) : null,
            released: app.released ? dateTime(app.released) : null
        };
    }

    function dateTime(input = new Date()) {
        const dtString = new Date(input);
        if (isNaN(dtString)) return null;
        return dtString.toISOString().slice(0, 19).replace('T', ' ');
    }

    function parseAndroidVersion(v) {
        if (!v) return null;
        const m = String(v).match(/\d+(\.\d+)?/);
        if (!m) return null;
        const n = parseFloat(m[0]);
        return Number.isFinite(n) ? n : null;
    }

    async function getDeveloperId(devId, devWeb, dev) {
        await pool.query(
            `INSERT INTO developers (
                developer_id,
                developer_website,
                developer
            )
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                developer_website = VALUES(developer_website),
                developer = VALUES(developer)`,
            [devId, devWeb, dev]
        );

        const [rows] = await pool.query(
            `SELECT id FROM developers WHERE developer_id = ?`,
            [devId]
        );
        return rows[0].id;
    }

    async function getGenreId(genreName) {
        await pool.query(
            `INSERT INTO genres (genre)
            VALUES (?)
            ON DUPLICATE KEY UPDATE genre = genre`,
            [genreName]
        );

        const [rows] = await pool.query(
            `SELECT id FROM genres WHERE genre = ?`,
            [genreName]
        );
        return rows[0].id;
    }

    async function setTags(gamesId, tagsList, appId) {
        const tagNames = tagsList.map(t => t.name);
        if (!tagNames.length) return console.log(`No tags for ${appId}`);

        await pool.query(
            `INSERT INTO tags (tag) VALUES ?
            ON DUPLICATE KEY UPDATE tag = tag`,
            [tagNames.map(n => [n])]
        );

        const [tagRows] = await pool.query(
            `SELECT id FROM tags WHERE tag IN (?)`,
            [tagNames]
        );

        const pairs = tagRows.map(r => [gamesId, r.id]);

        await pool.query(
            `INSERT INTO games_tags (game_id, tag_id) VALUES ?
            ON DUPLICATE KEY UPDATE game_id = game_id`,
            [pairs]
        );
    }

    async function updateGames(data) {
        try {
            for (const [appId, app] of Object.entries(data)) {
                try {
                    await pool.query(
                        `UPDATE games SET
                            modified_at      = ?,
                            title            = ?,
                            summary          = ?,
                            description_html = ?,
                            max_installs     = ?,
                            score            = ?,
                            ratings          = ?,
                            reviews          = ?,
                            price            = ?,
                            free             = ?,
                            ad_supported     = ?,
                            offers_iap       = ?,
                            android_version  = ?,
                            screenshots      = ?,
                            icon             = ?,
                            header_image     = ?,
                            url              = ?,
                            developer_id     = ?,
                            genre_id         = ?,
                            updated          = ?,
                            released         = ?
                        WHERE app_id = ?`,
                        [
                            app.modified_at,
                            app.title,
                            app.summary,
                            app.description_html,
                            app.max_installs,
                            app.score,
                            app.ratings,
                            app.reviews,
                            app.price,
                            app.free,
                            app.ad_supported,
                            app.offers_iap,
                            app.android_version,
                            app.screenshots,
                            app.icon,
                            app.header_image,
                            app.url,
                            app.developer_id,
                            app.genre_id,
                            app.updated,
                            app.released,
                            appId
                        ]
                    );
                } catch (err) {
                    console.error(`Update failed for ${appId}:`, err.message);
                }
            }
        } finally {
            await pool.end();
        }
    }

    const data = await fetchApps();
    await updateGames(data);
}

async function main(toDo) {
    if (toDo == "fill") await fillNullRows();
    else await syncOldRows();
}

await main(toDo);
