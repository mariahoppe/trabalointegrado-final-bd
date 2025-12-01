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
import { testConnection } from "../database/neo4jClient.js";

export async function syncData() {
  try {
    console.log("🔄 Iniciando sincronização...");

    // Verificar se Neo4j está disponível
    const neo4jAvailable = await testConnection();
    
    let clientesComAmigos = [];
    if (neo4jAvailable) {
      clientesComAmigos = await getAllClientsWithFriends();
    } else {
      console.log("⚠️  Sincronizando sem dados do Neo4j (não disponível)");
    }

    const [clientes, clientesComCompras, interesses] =
      await Promise.all([
        getAllClients(),            // base relacional
        getClientsWithPurchases(),  // relacional com compras
        getAllClientsInterests(),   // Mongo
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
    console.error("❌ Erro ao sincronizar dados: ", error.message);
    throw error;
  }
}

export default syncData;
