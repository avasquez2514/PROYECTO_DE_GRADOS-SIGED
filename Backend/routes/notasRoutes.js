// Importa Express y crea una instancia del enrutador
const express = require('express');
const router = express.Router();

// Importa el controlador que contiene la lógica de las notas
const notasController = require('../controllers/notasController');

// Importa el middleware de autenticación
const verificarToken = require('../middlewares/auth');


// ==============================
//  OBTENER NOTAS
// ==============================

/**
 * Ruta: GET /api/notas/:usuario_id
 * Descripción: Obtiene todas las notas del usuario
 */
router.get('/:usuario_id', verificarToken, notasController.obtenerNotas);

/**
 * Ruta: GET /api/notas/avances/:usuario_id
 * Descripción: Obtiene solo las notas de avances del usuario
 */
router.get('/avances/:usuario_id', verificarToken, notasController.obtenerNotasAvances);

/**
 * Ruta: GET /api/notas/plantillas-disponibles
 * Descripción: Obtiene todas las plantillas base disponibles
 */
router.get('/plantillas-disponibles', verificarToken, notasController.obtenerPlantillasDisponibles);


// ==============================
// ✍️ CREAR Y MODIFICAR NOTAS
// ==============================

/**
 * Ruta: POST /api/notas
 * Descripción: Crea una nueva nota personalizada
 * Body esperado: { usuario_id, novedad, nota_publica, nota_interna, nota_avances, plantilla }
 */
router.post('/', verificarToken, notasController.agregarNota);

/**
 * Ruta: POST /api/notas/asignar
 * Descripción: Asigna una plantilla base existente al usuario
 * Body esperado: { usuario_id, plantilla_id }
 */
router.post('/asignar', verificarToken, notasController.asignarNota);

/**
 * Ruta: PUT /api/notas/plantilla/:id
 * Descripción: Modifica una plantilla base existente por su ID
 */
router.put('/plantilla/:id', verificarToken, notasController.modificarPlantilla);


// ==============================
// 🧹 ELIMINAR O LIMPIAR NOTAS
// ==============================

/**
 * Ruta: DELETE /api/notas/:id
 * Descripción: Elimina completamente una nota (rompe la relación usuario ↔ plantilla)
 */
router.delete('/:id', verificarToken, notasController.eliminarNota);

/**
 * Ruta: PATCH /api/notas/limpiar-avances/:id
 * Descripción: Limpia solo el campo nota_avances (sin eliminar la fila)
 */
router.patch('/limpiar-avances/:id', verificarToken, notasController.limpiarNotaAvances);

/**
 * Ruta: DELETE /api/notas/plantilla/:id
 * Descripción: Elimina completamente una plantilla base
 */
router.delete('/plantilla/:id', verificarToken, notasController.eliminarPlantillaAdicional);

/**
 * Ruta: DELETE /api/notas/limpiar-plantillas-incorrectas
 * Descripción: Elimina plantillas con nombres incorrectos (como "AVANCE")
 */
router.delete('/limpiar-plantillas-incorrectas', verificarToken, notasController.limpiarPlantillasIncorrectas);


// Exporta el enrutador para ser usado en server.js
module.exports = router;
