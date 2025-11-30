// src/controllers/relationalController.js
import {
  getAllClients,
  getPurchasesByClientId,
  getClientsWithPurchases,
} from "../services/relationalService.js";

export async function getClientes(req, res) {
  try {
    const clientes = await getAllClients();
    res.status(200).json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Falha ao listar clientes",
      details: error.message,
    });
  }
}

export async function getComprasPorCliente(req, res) {
  try {
    const idCliente = parseInt(req.params.idCliente, 10);
    if (Number.isNaN(idCliente)) {
      return res.status(400).json({ error: "idCliente inválido" });
    }

    const compras = await getPurchasesByClientId(idCliente);
    res.status(200).json(compras);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Falha ao listar compras do cliente",
      details: error.message,
    });
  }
}

export async function getClientesComCompras(req, res) {
  try {
    const data = await getClientsWithPurchases();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Falha ao listar clientes com compras",
      details: error.message,
    });
  }
}
