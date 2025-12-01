import pkg from 'pg';
const { Client } = pkg;

let client;

export const getClient = async () => {
  if (!client) {
    client = new Client({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    });
    await client.connect();
    console.log("🟢 PostgreSQL conectado com sucesso");
  }
  return client;
};

export const query = async (text, params) => {
  const c = await getClient();
  return c.query(text, params);
};

export const ping = async () => {
  try {
    const res = await query("SELECT 1 as ok");
    return res.rows[0]?.ok === 1;
  } catch (error) {
    console.error("🔴 Erro no PostgreSQL:", error.message);
    return false;
  }
};

export default getClient;
