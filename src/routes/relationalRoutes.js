import { Router } from "express";
import {
  getClientes,
  getComprasPorCliente,
  getClientesComCompras,
} from "../controllers/relationalController.js";

const router = Router();

router.get("/clientes", getClientes);
router.get("/compras/:idCliente", getComprasPorCliente);
router.get("/clientes-compras", getClientesComCompras);

export default router;
