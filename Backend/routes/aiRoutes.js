// Backend/routes/aiRoutes.js (DEBES ASEGURARTE QUE ESTÉ ASÍ)

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Ruta para mejorar/corregir texto (UNIMODAL)
router.post('/mejorar-texto-chatgpt', aiController.mejorarTextoChatGPT);

// 💥 ¡LA RUTA QUE FALTABA Y CAUSABA EL 404! (MULTIMODAL)
router.post('/extraer-texto-imagen', aiController.extraerTextoImagen);

module.exports = router;