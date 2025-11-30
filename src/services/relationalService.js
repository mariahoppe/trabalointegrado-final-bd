// src/services/relationalService.js
import { query } from "../config/db.js";

export async function getAllClients() {
  const result = await query("SELECT * FROM clientes ORDER BY id", []);
  return result.rows;
}

export async function getPurchasesByClientId(idCliente) {
  const sql = `
    SELECT 
      c.id          AS compra_id,
      c.data        AS data_compra,
      p.id          AS produto_id,
      p.produto     AS produto,
      p.valor       AS valor
    FROM compras c
    JOIN produtos p ON p.id = c.id_produto
    WHERE c.id_cliente = $1
    ORDER BY c.data;
  `;
  const result = await query(sql, [idCliente]);
  return result.rows;
}

export async function getClientsWithPurchases() {
  const sql = `
    SELECT 
      cli.id        AS cliente_id,
      cli.cpf       AS cpf,
      cli.nome      AS nome,
      cli.endereco  AS endereco,
      cli.cidade    AS cidade,
      cli.uf        AS uf,
      cli.email     AS email,
      c.id          AS compra_id,
      c.data        AS data_compra,
      p.id          AS produto_id,
      p.produto     AS produto,
      p.valor       AS valor
    FROM clientes cli
    LEFT JOIN compras c ON c.id_cliente = cli.id
    LEFT JOIN produtos p ON p.id = c.id_produto
    ORDER BY cli.id, c.data;
  `;
  const result = await query(sql, []);

  const mapa = new Map();

  for (const row of result.rows) {
    if (!mapa.has(row.cliente_id)) {
      mapa.set(row.cliente_id, {
        id: row.cliente_id,
        cpf: row.cpf,
        nome: row.nome,
        endereco: row.endereco,
        cidade: row.cidade,
        uf: row.uf,
        email: row.email,
        compras: [],
      });
    }

    if (row.compra_id) {
      mapa.get(row.cliente_id).compras.push({
        id: row.compra_id,
        data: row.data_compra,
        produto: {
          id: row.produto_id,
          nome: row.produto,
          valor: row.valor,
        },
      });
    }
  }

  return Array.from(mapa.values());
}
