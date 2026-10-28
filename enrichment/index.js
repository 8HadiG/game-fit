import "dotenv/config";
import gplay from "google-play-scraper";
import { Pool } from "pg";

const limit = 100;

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

    console.log(rows.map(r => r.app_id));
}

main();