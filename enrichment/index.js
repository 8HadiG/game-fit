import "dotenv/config";
import gplay from "google-play-scraper";
import { Pool } from "pg";

const limit = 250;

const pool = new Pool();

async function main() {
    const { rows } = await pool.query(
        `SELECT app_id FROM scraped.games
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
        ORDER BY created_at ASC
        LIMIT $1`,
        [limit]
    );

    const appIds = rows.map(r => r.app_id);

    async function fetchApps(appIds) {
        const out = {};
        for (const appId of appIds) {
            try {
                out[appId] = normalizeApp(await gplay.app({ appId }));
            } catch (e) {
                console.error(`fetch failed for ${appId}:`, e.message);
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        return out;
    }

    function normalizeApp(app) {
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
            android_version: app.androidVersion ?? null,
            screenshots: app.screenshots ?? null,
            icon: app.icon ?? null,
            header_image: app.headerImage ?? null,
            ad_supported: app.adSupported ?? null,
            released: app.released ? toISODate(app.released) : null,
            url: app.url ?? null,
            updated_day: app.updated ? toISODate(app.updated) : null,
        };
    }

    function toISODate(input) {
        const d = new Date(input);
        if (isNaN(d)) return null;
        return d.toISOString().slice(0, 10);
    }

    async function updateGames(data) {
        for (const [appId, app] of Object.entries(data)) {
            await pool.query(`
            UPDATE scraped.games SET
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
                updated_day      = $19
            WHERE app_id = $1
            `, [
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
                app.updated_day,
            ]);
        }
    }

    const data = await fetchApps(appIds);
    await updateGames(data);
}

main();