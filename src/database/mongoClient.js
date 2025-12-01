import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGO_DB_NAME || "trabalho_final_bd";

let client;
let db;

export async function connectMongo() {
  if (db) return db;

  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);

  console.log("🟢 MongoDB conectado com sucesso");
  return db;
}

export default connectMongo;
