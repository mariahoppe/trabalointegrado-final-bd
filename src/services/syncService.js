import { redis } from "./redisClient.js";
import {
  getAllClients,
  getClientsWithPurchases,
} from "./relationalService.js";
import {
  getAllClientsInterests,
} from "../database/documentService.js";
import {
  getAllClientsWithFriends,
} from "../database/graphService.js";

export async function syncData() {
  try {
    console.log("🔄 Iniciando sincronização...");

    const [clientes, clientesComCompras, interesses, clientesComAmigos] =
      await Promise.all([
        getAllClients(),            // base relacional
        getClientsWithPurchases(),  // relacional com compras
        getAllClientsInterests(),   // Mongo
        getAllClientsWithFriends(), // Neo4j
      ]);

    await redis.set("clientes", JSON.stringify(clientes));
    await redis.set(
      "clientes_compras",
      JSON.stringify(clientesComCompras)
    );
    await redis.set(
      "interesses_clientes",
      JSON.stringify(interesses)
    );
    await redis.set(
      "amigos_clientes",
      JSON.stringify(clientesComAmigos)
    );

    console.log("✅ Dados sincronizados com sucesso no Redis!");
  } catch (error) {
    console.error("❌ Erro ao sincronizar dados: ", error);
    throw error;
  }
}

  export default syncData;
