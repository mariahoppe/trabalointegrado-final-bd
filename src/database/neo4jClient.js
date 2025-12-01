import neo4j from "neo4j-driver";

const NEO4J_URI = process.env.NEO4J_URI || "bolt://localhost:7687";
const NEO4J_USER = process.env.NEO4J_USER || "neo4j";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "mariahoppe";

export const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

export async function getSession() {
  return driver.session();
}

// Teste de conexão
export async function testConnection() {
  try {
    const session = driver.session();
    await session.run("RETURN 1 as test");
    session.close();
    console.log("🟢 Neo4j conectado com sucesso");
    return true;
  } catch (error) {
    console.log("🔴 Neo4j não está disponível:", error.message);
    return false;
  }
}

export default driver;
