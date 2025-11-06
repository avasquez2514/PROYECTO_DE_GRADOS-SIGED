// ✅ Rutas de Envío de Correos

const express = require("express");
const multer = require("multer");
const router = express.Router();

// Importa los controladores
const {
  enviarCorreo,
  verificarConfiguracion
} = require("../controllers/correosController");

// Importa el middleware de autenticación
const verificarToken = require("../middlewares/auth");

// Configuración de multer para manejar archivos
const upload = multer({
  storage: multer.memoryStorage(), // Almacenar en memoria
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10MB por archivo
    files: 5 // Máximo 5 archivos
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

/**
 * Ruta: POST /api/correos/enviar
 * Descripción: Envía un correo electrónico con archivos adjuntos
 * Body esperado: FormData con campos { para, cc?, asunto, mensaje, archivos_info, archivo_0, archivo_1, ... }
 */
router.post("/enviar", verificarToken, upload.any(), enviarCorreo);

/**
 * Ruta: GET /api/correos/verificar
 * Descripción: Verifica la configuración del servicio de correo
 */
router.get("/verificar", verificarToken, verificarConfiguracion);

// Exporta el enrutador para ser usado en server.js
module.exports = router;
