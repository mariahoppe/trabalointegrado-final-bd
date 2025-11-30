// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import relationalRoutes from "./routes/relationalRoutes.js";
import { ping } from "./config/db.js";

import {
  getInterestsByClientId,
  getAllClientsInterests,
} from "./database/documentService.js";

import {
  getFriendsByClientId,
  getAllClientsWithFriends,
} from "./database/graphService.js";

import { redis } from "./services/redisClient.js";
import { syncData } from "./services/syncService.js";

dotenv.config();

// LOG PRA TESTE
console.log(">>> app.js começou a executar");

const app = express();
app.use(cors());
app.use(express.json());

// Health check geral
app.get("/health", async (req, res) => {
  try {
    const ok = await ping();
    res.json({ status: ok ? "ok" : "degraded" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", details: e.message });
  }
});

//
// ROTAS BASE RELACIONAL (Pessoa A)
//
app.use("/", relationalRoutes);

//
// ROTAS MONGO (Pessoa B) – só pra teste/consulta
//
app.get("/mongo/interesses", async (req, res) => {
  try {
    const data = await getAllClientsInterests();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar interesses no MongoDB");
  }
});

app.get("/mongo/interesses/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await getInterestsByClientId(id);
    if (!data) {
      return res
        .status(404)
        .send("Interesses não encontrados para esse cliente");
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar interesses do cliente no MongoDB");
  }
});

//
// ROTAS NEO4J (Pessoa B) – só pra teste/consulta
//
app.get("/neo/clientes-amigos", async (req, res) => {
  try {
    const data = await getAllClientsWithFriends();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar clientes e amigos no Neo4j");
  }
});

app.get("/neo/clientes-amigos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await getFriendsByClientId(id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar amigos do cliente no Neo4j");
  }
});

//
// ROTAS REDIS – o que a prof pediu na especificação
//

// 1) Mostrar os dados de todos os clientes.
app.get("/redis/clientes", async (req, res) => {
  try {
    const clients = await redis.get("clientes");
    res.json(JSON.parse(clients || "[]"));
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao recuperar clientes do Redis");
  }
});

// 2) Mostrar os dados dos clientes e as compras realizadas por eles.
app.get("/redis/clientes-compras", async (req, res) => {
  try {
    const data = await redis.get("clientes_compras");
    res.json(JSON.parse(data || "[]"));
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao recuperar clientes e compras do Redis");
  }
});

// 3) Mostrar os dados dos clientes e seus amigos.
app.get("/redis/clientes-amigos", async (req, res) => {
  try {
    const data = await redis.get("amigos_clientes");
    res.json(JSON.parse(data || "[]"));
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao recuperar clientes e amigos do Redis");
  }
});

// 4) Listar os dados dos amigos dos clientes e as possíveis recomendações para eles.
app.get("/redis/amigos-recomendacoes", async (req, res) => {
  try {
    const amigosRaw = await redis.get("amigos_clientes");
    const interessesRaw = await redis.get("interesses_clientes");
    const comprasRaw = await redis.get("clientes_compras");

    const amigos = JSON.parse(amigosRaw || "[]");
    const interesses = JSON.parse(interessesRaw || "[]");
    const compras = JSON.parse(comprasRaw || "[]");

    const recomendacoes = [];

    // Para cada cliente da base relacional (com compras)
    for (const cliente of compras) {
      const amigosCliente =
        amigos.find((a) => a.id === cliente.id)?.amigos || [];
      const interessesCliente = interesses.find(
        (i) => i.id_cliente === cliente.id
      );

      // Para cada amigo dele, recomenda os produtos já comprados pelo cliente
      for (const amigo of amigosCliente) {
        recomendacoes.push({
          cliente: {
            id: cliente.id,
            nome: cliente.nome,
          },
          amigo,
          interesses_cliente: interessesCliente?.interesses || null,
          compras_cliente: cliente.compras || [],
        });
      }
    }

    res.json(recomendacoes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao recuperar recomendações do Redis");
  }
});

// Rota para sincronizar tudo no Redis
app.get("/sync", async (req, res) => {
  try {
    await syncData();
    res.send("Dados sincronizados com sucesso!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao sincronizar dados");
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(PORT, () => {
  console.log(`🚀 API integrada rodando na porta ${PORT}`);
});
