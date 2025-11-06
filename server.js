// server.js

// Importa el framework Express para crear un servidor backend
const express = require("express");

// Importa Next.js para manejar el frontend basado en React
const next = require("next");

// Middleware que permite solicitudes desde otros dominios (Cross-Origin Resource Sharing)
const cors = require("cors");

// Middleware para analizar los cuerpos de las peticiones (JSON, urlencoded)
// Aunque Express tiene sus propios métodos, body-parser es a veces preferido para límites.
// Reemplazaremos express.json/urlencoded con un límite más alto.
// const bodyParser = require('body-parser'); // No necesario si usamos express.json({limit})

// Carga variables de entorno desde un archivo .env al objeto process.env
require("dotenv").config();

// Importa las rutas personalizadas del backend
const authRoutes = require("./Backend/routes/authRoutes");  // Rutas para autenticación
const notasRoutes = require("./Backend/routes/notasRoutes"); // Rutas para notas
const aplicativosRoutes = require("./Backend/routes/aplicativosRoutes"); // Rutas para aplicativos
const correosRoutes = require("./Backend/routes/correosRoutes");  // Rutas para envío de correos
const aiRoutes = require("./Backend/routes/aiRoutes");  // Rutas para IA

// Verifica si la aplicación está en modo desarrollo (true si NODE_ENV no es "production")
const dev = process.env.NODE_ENV !== "production";

// Inicializa la aplicación Next.js con configuración de entorno
const appNext = next({ dev });

// Obtiene el manejador de rutas de Next.js, que permite servir las páginas del frontend
const handle = appNext.getRequestHandler();

// Prepara la aplicación Next.js antes de iniciar el servidor Express
appNext.prepare().then(() => {
 // Crea una instancia de servidor con Express
 const app = express();

 // Usa CORS para permitir solicitudes desde otros orígenes
 app.use(cors());

 // Permite que Express entienda y reciba solicitudes en formato JSON
 // 💡 Establece límites altos para soportar imágenes grandes en base64
 app.use(express.json({ limit: '50mb' }));
 app.use(express.urlencoded({ limit: '50mb', extended: true }));

 /**
   * Configuración de rutas del backend
   * Todas las rutas que comienzan por /api/... son manejadas por sus respectivos archivos
   */
 app.use("/api/auth", authRoutes);             // http://localhost:4000/api/auth
 app.use("/api/notas", notasRoutes);           // http://localhost:4000/api/notas
 app.use("/api/aplicativos", aplicativosRoutes); // http://localhost:4000/api/aplicativos
 app.use("/api/correos", correosRoutes);       // http://localhost:4000/api/correos
 
 // 💥 PUNTO CLAVE: El prefijo de la IA es /api/ia
 app.use("/api/ia", aiRoutes);                 // http://localhost:4000/api/ia

 /**
   * Manejo del frontend
   * Si ninguna de las rutas anteriores coincide, se pasa el control a Next.js
   */
 app.use((req, res) => {
    return handle(req, res); // Sirve las páginas de Next.js
 });

// Define el puerto del servidor, ya sea desde .env o por defecto 4000
 const PORT = process.env.PORT || 4000;

    // Inicia el servidor escuchando en el puerto definido
    app.listen(PORT, () => {
    console.log(`🚀 Servidor combinado corriendo en http://localhost:${PORT}`);
    });
});