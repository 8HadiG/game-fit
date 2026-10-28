import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool();

async function main() {
    try {
        const result = await pool.query(
            "SELECT current_database() AS database, current_user AS user"
        );

        console.log("Database connection successful.");
        console.log("Connected database:", result.rows[0].database);
        console.log("Connected user:", result.rows[0].user);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

main();