// ✅ Rutas de Aplicativos

const express = require("express");
const router = express.Router();

// Importa los controladores
const {
  obtenerAplicativos,
  agregarAplicativo,
  asignarAplicativo,
  eliminarAplicativo,
  obtenerAplicativosDisponibles,
} = require("../controllers/aplicativosController");

// Importa el middleware de autenticación
const verificarToken = require("../middlewares/auth");

/**
 * Ruta: GET /api/aplicativos?usuario_id=xxx
 * Descripción: Obtiene todos los aplicativos del usuario según su ID
 */
router.get("/", verificarToken, obtenerAplicativos);

/**
 * Ruta: GET /api/aplicativos/disponibles
 * Descripción: Obtiene todos los aplicativos base disponibles
 */
router.get("/disponibles", verificarToken, obtenerAplicativosDisponibles);

/**
 * Ruta: POST /api/aplicativos
 * Descripción: Crea un nuevo aplicativo personalizado
 * Body esperado: { usuario_id, nombre, url, categoria }
 */
router.post("/", verificarToken, agregarAplicativo);

/**
 * Ruta: POST /api/aplicativos/asignar
 * Descripción: Asigna un aplicativo base existente al usuario
 * Body esperado: { usuario_id, aplicativo_base_id }
 */
router.post("/asignar", verificarToken, asignarAplicativo);

/**
 * Ruta: DELETE /api/aplicativos/:id
 * Descripción: Elimina un aplicativo específico por su ID
 */
router.delete("/:id", verificarToken, eliminarAplicativo);

// Exporta el enrutador para ser usado en server.js
module.exports = router;
