import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

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
