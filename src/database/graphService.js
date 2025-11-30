import { getSession } from "./neo4jClient.js";

export async function getFriendsByClientId(idCliente) {
  const session = await getSession();

  try {
    const result = await session.run(
      `
      MATCH (c:Cliente {id: $id})-[:AMIGO_DE]->(amigo:Cliente)
      RETURN amigo
      `,
      { id: idCliente }
    );

    return result.records.map((record) => {
      const node = record.get("amigo");
      return {
        id: node.properties.id,
        nome: node.properties.nome,
      };
    });
  } finally {
    await session.close();
  }
}

export async function getAllClientsWithFriends() {
  const session = await getSession();

  try {
    const result = await session.run(
      `
      MATCH (c:Cliente)-[:AMIGO_DE]->(amigo:Cliente)
      RETURN c, collect(amigo) AS amigos
      `
    );

    return result.records.map((record) => {
      const c = record.get("c");
      const amigos = record.get("amigos");

      return {
        id: c.properties.id,
        nome: c.properties.nome,
        amigos: amigos.map((a) => ({
          id: a.properties.id,
          nome: a.properties.nome,
        })),
      };
    });
  } finally {
    await session.close();
  }
}
