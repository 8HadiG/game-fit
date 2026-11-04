import "dotenv/config";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME
});

async function main() {
  try {
    const [rows] = await pool.query(
      "SELECT DATABASE() AS db, USER() AS user"
    );
    console.log("Database connection successful.");
    console.log("Connected database: ", rows[0].db);
    console.log("Connected user: ", rows[0].user);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
