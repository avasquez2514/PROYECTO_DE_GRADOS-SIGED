/**
 * ==============================================================================
 * Componente de Backend: authMiddleware (verificarToken)
 * ==============================================================================
 * Middleware de Express para validar y decodificar JSON Web Tokens (JWT).
 */

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.KEY;

/**
 * Middleware para verificar la validez de un JWT proporcionado en el encabezado Authorization.
 * * @param {import('express').Request} req - La solicitud de Express.
 * @param {import('express').Response} res - La respuesta de Express.
 * @param {import('express').NextFunction} next - Función para continuar al siguiente middleware/ruta.
 */
const verificarToken = (req, res, next) => {
    // Extraer el encabezado de autorización
    const authHeader = req.headers.authorization;

    // 1. Verificar si el encabezado existe
    if (!authHeader) {
        return res.status(401).json({ mensaje: "Token no proporcionado" });
    }

    // El formato esperado es "Bearer <token>"
    const parts = authHeader.split(" ");
    
    // 2. Verificar el formato y extraer el token
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return res.status(401).json({ mensaje: "Formato de token inválido (Esperado: Bearer <token>)" });
    }
    
    const token = parts[1];

    // 3. Verificar si el secreto está configurado
    if (!JWT_SECRET) {
        console.error("❌ JWT_SECRET no está configurado. Verificar archivo .env");
        return res.status(500).json({ mensaje: "Error de configuración del servidor" });
    }

    // 4. Verificar y decodificar el token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Adjuntar el payload del usuario a la solicitud
        req.usuario = decoded; // contiene el { id, email } generado durante el login/registro
        
        next(); // Continuar con el siguiente manejador de ruta
    } catch (error) {
        console.error("❌ Error al verificar token:", error.message);
        
        // Manejo de errores específicos del JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ mensaje: "Token expirado" });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ mensaje: "Token inválido (Firma o formato incorrecto)" });
        } else {
            return res.status(403).json({ mensaje: "Token inválido" });
        }
    }
};

module.exports = verificarToken;