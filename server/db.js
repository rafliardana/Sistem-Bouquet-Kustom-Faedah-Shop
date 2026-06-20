import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

// Connection pool — reused across the application
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Log connection errors
pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err.message);
});

/**
 * Initialize database: create tables if they don't exist.
 * Reads init.sql and executes it.
 */
export async function initDatabase() {
  const client = await pool.connect();
  try {
    const sql = readFileSync(join(__dirname, "init.sql"), "utf-8");
    await client.query(sql);
    console.log("✅ Database tables initialized");
  } catch (err) {
    console.error("❌ Database initialization error:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Helper: run a single query with params
 */
export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

/**
 * Helper: get a single row
 */
export async function queryOne(text, params) {
  const result = await pool.query(text, params);
  return result.rows[0] || null;
}

/**
 * Helper: get all rows
 */
export async function queryAll(text, params) {
  const result = await pool.query(text, params);
  return result.rows;
}
