/**
 * ==============================================================================
 * Componente de Backend: db.js
 * ==============================================================================
 * Inicializa la conexión a la base de datos PostgreSQL/Supabase.
 */

// Importa la clase Pool del driver 'pg'
const { Pool } = require("pg");

// Carga las variables de entorno (incluyendo DATABASE_URL)
require("dotenv").config();

// Inicializa el pool de conexiones
const pool = new Pool({
    // Usa la URL completa de conexión de la variable de entorno
    connectionString: process.env.DATABASE_URL, 
    // Configuración SSL requerida para muchos servicios en la nube (ej: Supabase)
    ssl: { rejectUnauthorized: false }
});

// Prueba la conexión al iniciar el módulo y registra el resultado
pool.connect()
    .then(() => console.log("✅ Conexión exitosa a Supabase"))
    .catch(err => console.error("❌ Error de conexión a Supabase:", err.message));

// Exporta el pool para que otros módulos lo usen para realizar consultas
module.exports = pool;