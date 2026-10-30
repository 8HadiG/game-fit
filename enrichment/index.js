import "dotenv/config";
import gplay from "google-play-scraper";
import { Pool } from "pg";

const limit = Number(process.argv[2]) || 2;

const pool = new Pool();

async function main() {
    const { rows: gameRows } = await pool.query(
        `SELECT id, app_id FROM scraped.games
        WHERE (
            title IS NULL OR
            description_html IS NULL OR
            summary IS NULL OR
            max_installs IS NULL OR
            score IS NULL OR
            ratings IS NULL OR
            reviews IS NULL OR
            price_cents IS NULL OR
            free IS NULL OR
            offers_iap IS NULL OR
            android_version IS NULL OR
            screenshots IS NULL OR
            icon IS NULL OR
            header_image IS NULL OR
            ad_supported IS NULL OR
            released IS NULL OR
            url IS NULL OR
            developer_id IS NULL OR
            genre_id IS NULL OR
            updated_day IS NULL
        )
        ORDER BY last_modified ASC NULLS FIRST,
            created_at ASC
        LIMIT $1`,
        [limit]
    );

    const games = gameRows.map(r => ({ id: r.id, app_id: r.app_id }));

    async function fetchApps(games) {
        const out = {};
        for (const game of games) {
            const { id, app_id } = game;
            try {
                const app = await gplay.app({ appId: app_id });
                out[app_id] = await normalizeApp(app);
                await setTags(id, out[app_id].categories);
            } catch (e) {
                console.error(`fetch failed for ${app_id}:`, e.message);
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        return out;
    }

    async function normalizeApp(app) {
        return {
            ...app,

            title: app.title ?? null,
            description_html: app.descriptionHTML ?? null,
            summary: app.summary ?? null,
            max_installs: app.maxInstalls ?? null,
            score: app.score ?? null,
            ratings: app.ratings ?? null,
            reviews: app.reviews ?? null,
            price_cents: app.price != null ? Math.round(app.price * 100) : null,
            free: app.free ?? null,
            offers_iap: app.offersIAP ?? null,
            android_version: parseAndroidVersion(app.androidVersion),
            screenshots: app.screenshots ?? null,
            icon: app.icon ?? null,
            header_image: app.headerImage ?? null,
            ad_supported: app.adSupported ?? null,
            released: app.released ? toISODate(app.released) : null,
            url: app.url ?? null,
            developer_id: await getDeveloperId(
                app.developerId,
                app.developerWebsite,
                app.developer
            ),
            genre_id: await getGenreId(app.genre),
            updated_day: app.updated ? toISODate(app.updated) : null,
        };
    }

    async function setTags(gamesId, tagsList) {
        for (const tag of tagsList) {

            const tagName = tag.name;

            const { rows: tagRows } = await pool.query(
                `INSERT INTO scraped.tags (tag)
                VALUES ($1)
                ON CONFLICT (tag) DO UPDATE SET
                    tag = EXCLUDED.tag
                RETURNING id`,
                [tagName]
            );

            await pool.query(
                `INSERT INTO scraped.game_tags (game_id, tag_id)
                VALUES ($1, $2)
                ON CONFLICT (game_id, tag_id) DO NOTHING`,
                [gamesId, tagRows[0].id]
            );
        }
    }

    async function getDeveloperId(devId, devWeb, dev) {
        const { rows: developerRows } = await pool.query(
            `INSERT INTO scraped.developers (
                developer_id,
                developer_website,
                developer
            )
            VALUES ($1, $2, $3)
            ON CONFLICT (developer_id) DO UPDATE SET
                developer_website = EXCLUDED.developer_website,
                developer = EXCLUDED.developer
            RETURNING id`,
            [devId, devWeb, dev]
        );
        return developerRows[0].id;
    }

    async function getGenreId(genreName) {
        const { rows: genreRows } = await pool.query(
            `INSERT INTO scraped.genres (genre)
            VALUES ($1)
            ON CONFLICT (genre) DO UPDATE SET
                genre = EXCLUDED.genre
            RETURNING id`,
            [genreName]
        );
        return genreRows[0].id;
    }

    function toISODate(input) {
        const d = new Date(input);
        if (isNaN(d)) return null;
        return d.toISOString().slice(0, 10);
    }

    function parseAndroidVersion(v) {
        if (!v) return null;
        const m = String(v).match(/\d+(\.\d+)?/);
        if (!m) return null;
        const n = parseFloat(m[0]);
        return Number.isFinite(n) ? n : null;
    }

    async function updateGames(data) {
        for (const [appId, app] of Object.entries(data)) {
            await pool.query(
                `UPDATE scraped.games SET
                    title            = $2,
                    description_html = $3,
                    summary          = $4,
                    max_installs     = $5,
                    score            = $6,
                    ratings          = $7,
                    reviews          = $8,
                    price_cents      = $9,
                    free             = $10,
                    offers_iap       = $11,
                    android_version  = $12,
                    screenshots      = $13,
                    icon             = $14,
                    header_image     = $15,
                    ad_supported     = $16,
                    released         = $17,
                    url              = $18,
                    developer_id     = $19,
                    genre_id         = $20,
                    updated_day      = $21
                WHERE app_id = $1`,
                [
                    appId,
                    app.title,
                    app.description_html,
                    app.summary,
                    app.max_installs,
                    app.score,
                    app.ratings,
                    app.reviews,
                    app.price_cents,
                    app.free,
                    app.offers_iap,
                    app.android_version,
                    app.screenshots,
                    app.icon,
                    app.header_image,
                    app.ad_supported,
                    app.released,
                    app.url,
                    app.developer_id,
                    app.genre_id,
                    app.updated_day
                ]
            );
        }
    }

    const data = await fetchApps(games);
    await updateGames(data);
}

await main();