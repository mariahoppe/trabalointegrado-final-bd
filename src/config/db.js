import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  max: process.env.PGPOOL_MAX ? Number(process.env.PGPOOL_MAX) : 10,
  idleTimeoutMillis: process.env.PGPOOL_IDLE
    ? Number(process.env.PGPOOL_IDLE)
    : 30000,
});

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();

export const ping = async () => {
  const res = await query("SELECT 1 as ok");
  return res.rows[0]?.ok === 1;
};
