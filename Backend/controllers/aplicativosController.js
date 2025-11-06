/**
 * ==============================================================================
 * Componente de Backend: aplicativosController
 * ==============================================================================
 * Centraliza la lógica de negocio para la gestión de aplicativos de usuario.
 * Utiliza un modelo de datos normalizado (aplicativos_base y aplicativos_rel).
 */

// Importa la conexión a la base de datos PostgreSQL
const pool = require("../db");

// Importa la función uuidv4 del paquete 'uuid' para generar identificadores únicos
const { v4: uuidv4 } = require("uuid");

/**
 * ==============================================================================
 * FUNCIÓN 1: obtenerAplicativos
 * ==============================================================================
 * Descripción: Obtiene todos los aplicativos vinculados a un usuario específico.
 * Método: GET
 * Ruta Lógica: /api/aplicativos?usuario_id=ID
 *
 * @param {import('express').Request} req - Requiere 'usuario_id' en los query parameters.
 * @param {import('express').Response} res - Devuelve la lista de aplicativos.
 */
const obtenerAplicativos = async (req, res) => {
    const { usuario_id } = req.query; // Extrae el ID del usuario desde la consulta

    try {
        // Consulta que une aplicativos_rel (relación) y aplicativos_base (detalles)
        const resultado = await pool.query(
            `
            SELECT 
              ar.id,
              ab.nombre,
              ab.url,
              ab.categoria,
              ar.creado_en
            FROM aplicativos_rel ar
            INNER JOIN aplicativos_base ab ON ar.aplicativo_base_id = ab.id
            WHERE ar.usuario_id = $1
            ORDER BY ar.creado_en DESC
            `,
            [usuario_id]
        );

        res.json(resultado.rows);
    } catch (error) {
        console.error("❌ Error al obtener aplicativos:", error);
        res.status(500).json({ mensaje: "Error al obtener aplicativos" });
    }
};

/**
 * ==============================================================================
 * FUNCIÓN 2: agregarAplicativo
 * ==============================================================================
 * Descripción: Crea un nuevo registro en 'aplicativos_base' (personalizado) y luego
 * establece la relación con el usuario en 'aplicativos_rel' (DOBLE INSERCIÓN).
 * Método: POST
 * Ruta Lógica: /api/aplicativos
 *
 * @param {import('express').Request} req - Requiere 'usuario_id' y 'nombre' en el body.
 * @param {import('express').Response} res - Devuelve los IDs creados.
 */
const agregarAplicativo = async (req, res) => {
    const { usuario_id, nombre, url, categoria } = req.body;

    // Validación de entrada
    if (!usuario_id || !nombre) {
        return res.status(400).json({ 
            mensaje: "Se requieren usuario_id y nombre como mínimo" 
        });
    }

    try {
        // 1. Verificar que el usuario existe (validación de integridad referencial)
        const usuarioExiste = await pool.query(
            "SELECT id FROM usuarios WHERE id = $1", 
            [usuario_id]
        );
        
        if (usuarioExiste.rows.length === 0) {
            return res.status(404).json({ 
                mensaje: "Usuario no encontrado" 
            });
        }

        // 2. Crear nueva plantilla base personalizada (aplicativos_base)
        const aplicativoId = uuidv4();
        await pool.query(
            `
            INSERT INTO aplicativos_base (id, nombre, url, categoria)
            VALUES ($1, $2, $3, $4)
            `,
            [aplicativoId, nombre, url || '', categoria || 'Personalizado']
        );

        // 3. Crear la relación usuario-aplicativo (aplicativos_rel)
        const relacionId = uuidv4();
        await pool.query(
            `
            INSERT INTO aplicativos_rel (id, usuario_id, aplicativo_base_id, creado_en)
            VALUES ($1, $2, $3, NOW())
            `,
            [relacionId, usuario_id, aplicativoId]
        );

        res.status(201).json({ 
            mensaje: "Aplicativo personalizado creado exitosamente",
            id: relacionId,
            aplicativo_base_id: aplicativoId
        });
    } catch (error) {
        console.error("❌ Error al agregar aplicativo personalizado:", error);
        res.status(500).json({ 
            mensaje: "Error al agregar aplicativo personalizado", 
            error: error.message 
        });
    }
};

/**
 * ==============================================================================
 * FUNCIÓN 3: asignarAplicativo
 * ==============================================================================
 * Descripción: Asigna un aplicativo base (preexistente) a un usuario. Solo inserta
 * una relación en 'aplicativos_rel'.
 * Método: POST
 * Ruta Lógica: /api/aplicativos/asignar
 *
 * @param {import('express').Request} req - Requiere 'usuario_id' y 'aplicativo_base_id' en el body.
 * @param {import('express').Response} res - Devuelve el ID de la relación creada.
 */
const asignarAplicativo = async (req, res) => {
    const { usuario_id, aplicativo_base_id } = req.body;

    // Validación de entrada
    if (!usuario_id || !aplicativo_base_id) {
        return res.status(400).json({ 
            mensaje: "Se requieren usuario_id y aplicativo_base_id" 
        });
    }

    try {
        // 1. Verificar existencia de Usuario
        const usuarioExiste = await pool.query(
            "SELECT id FROM usuarios WHERE id = $1", 
            [usuario_id]
        );
        
        if (usuarioExiste.rows.length === 0) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // 2. Verificar existencia de Aplicativo Base
        const aplicativoExiste = await pool.query(
            "SELECT id FROM aplicativos_base WHERE id = $1", 
            [aplicativo_base_id]
        );
        
        if (aplicativoExiste.rows.length === 0) {
            return res.status(404).json({ mensaje: "Aplicativo base no encontrado" });
        }

        // 3. Verificar si la relación ya existe (prevención de duplicados)
        const relacionExiste = await pool.query(
            "SELECT id FROM aplicativos_rel WHERE usuario_id = $1 AND aplicativo_base_id = $2", 
            [usuario_id, aplicativo_base_id]
        );
        
        if (relacionExiste.rows.length > 0) {
            return res.status(409).json({ 
                mensaje: "El aplicativo ya está agregado para este usuario" 
            });
        }

        const id = uuidv4();

        // 4. Inserta la relación usuario-aplicativo
        await pool.query(
            `
            INSERT INTO aplicativos_rel (id, usuario_id, aplicativo_base_id, creado_en)
            VALUES ($1, $2, $3, NOW())
            `,
            [id, usuario_id, aplicativo_base_id]
        );

        res.status(201).json({ 
            mensaje: "Aplicativo asignado exitosamente",
            id: id
        });
    } catch (error) {
        console.error("❌ Error al asignar aplicativo:", error);
        res.status(500).json({ 
            mensaje: "Error al asignar aplicativo", 
            error: error.message 
        });
    }
};

/**
 * ==============================================================================
 * FUNCIÓN 4: eliminarAplicativo
 * ==============================================================================
 * Descripción: Elimina una relación. Si el aplicativo base asociado solo era usado
 * por ese usuario (personalizado), también lo elimina de 'aplicativos_base'
 * (Lógica de Autolimpieza).
 * Método: DELETE
 * Ruta Lógica: /api/aplicativos/:id (id = id de aplicativos_rel)
 *
 * @param {import('express').Request} req - Requiere el 'id' de la relación en los path params.
 * @param {import('express').Response} res - Devuelve el nombre del aplicativo eliminado.
 */
const eliminarAplicativo = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ 
            mensaje: "Se requiere el ID del aplicativo" 
        });
    }

    try {
        // 1. Obtener información de la relación y contar otros usuarios vinculados
        const relacionInfo = await pool.query(
            `
            SELECT 
              ar.id as relacion_id,
              ar.usuario_id,
              ar.aplicativo_base_id,
              ab.nombre,
              COUNT(ar2.id) as total_usuarios_con_este_aplicativo
            FROM aplicativos_rel ar
            INNER JOIN aplicativos_base ab ON ar.aplicativo_base_id = ab.id
            LEFT JOIN aplicativos_rel ar2 ON ab.id = ar2.aplicativo_base_id
            WHERE ar.id = $1
            GROUP BY ar.id, ar.usuario_id, ar.aplicativo_base_id, ab.nombre
            `, 
            [id]
        );
        
        if (relacionInfo.rows.length === 0) {
            return res.status(404).json({ 
                mensaje: "Aplicativo no encontrado para este usuario" 
            });
        }

        const info = relacionInfo.rows[0];
        // Si solo hay un usuario, es el usuario actual, por lo que es "personalizado"
        const esAplicativoPersonalizado = info.total_usuarios_con_este_aplicativo === 1;

        // 2. Eliminar la relación usuario-aplicativo
        const resultRelacion = await pool.query(
            "DELETE FROM aplicativos_rel WHERE id = $1", 
            [id]
        );

        if (resultRelacion.rowCount === 0) {
            return res.status(404).json({ 
                mensaje: "No se pudo eliminar la relación del aplicativo" 
            });
        }

        // 3. Lógica de Autolimpieza: Si es personalizado, eliminar también el aplicativo base
        if (esAplicativoPersonalizado) {
            await pool.query(
                "DELETE FROM aplicativos_base WHERE id = $1", 
                [info.aplicativo_base_id]
            );
            console.log(`✅ Aplicativo personalizado "${info.nombre}" eliminado completamente`);
        }

        res.json({ 
            mensaje: "Aplicativo eliminado correctamente",
            aplicativo_eliminado: esAplicativoPersonalizado,
            aplicativo_nombre: info.nombre
        });
    } catch (error) {
        console.error("❌ Error al eliminar aplicativo:", error);
        res.status(500).json({ 
            mensaje: "Error al eliminar aplicativo", 
            error: error.message 
        });
    }
};

/**
 * ==============================================================================
 * FUNCIÓN 5: obtenerAplicativosDisponibles
 * ==============================================================================
 * Descripción: Obtiene el listado completo de todos los aplicativos base disponibles
 * para que el usuario pueda asignar.
 * Método: GET
 * Ruta Lógica: /api/aplicativos/disponibles
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res - Devuelve el catálogo completo.
 */
const obtenerAplicativosDisponibles = async (req, res) => {
    try {
        const resultado = await pool.query(
            `
            SELECT 
              id,
              nombre,
              url,
              categoria
            FROM aplicativos_base
            ORDER BY categoria ASC, nombre ASC
            `
        );

        res.json(resultado.rows);
    } catch (error) {
        console.error("❌ Error al obtener aplicativos disponibles:", error);
        res.status(500).json({ 
            mensaje: "Error al obtener aplicativos disponibles", 
            error: error.message 
        });
    }
};

// Exporta los controladores
module.exports = {
    obtenerAplicativos,
    agregarAplicativo,
    asignarAplicativo,
    eliminarAplicativo,
    obtenerAplicativosDisponibles,
};