/**
 * ==============================================================================
 * 🛣️ Componente de Backend: authRoutes
 * ==============================================================================
 * Define las rutas de la API para la autenticación y gestión de usuarios.
 */

const express = require("express");
const router = express.Router();

// Importación de las funciones del controlador de autenticación
const {
    registrarUsuario,
    loginUsuario,
    cambiarContraseña,
    recuperarContraseña,
    asignarContenidoDefecto,
} = require("../controllers/authController");

// Importación del middleware de seguridad (JWT)
const verificarToken = require("../middlewares/auth");

/** * Rutas de Autenticación Públicas (Acceso libre)
 */
router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);
router.put("/recuperar-contrasena", recuperarContraseña);

/**
 * Rutas de Autenticación Protegidas (Requieren JWT)
 * Se inserta el middleware 'verificarToken' antes de la función del controlador.
 */
// 🔒 Requiere JWT para cambiar la contraseña del usuario logueado
router.put("/cambiar-contraseña", verificarToken, cambiarContraseña); 
// 🔒 Requiere JWT (probablemente de un administrador o con propósito interno)
router.post("/asignar-contenido-defecto", verificarToken, asignarContenidoDefecto); 

module.exports = router;