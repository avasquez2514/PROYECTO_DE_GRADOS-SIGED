/**
 * ==============================================================================
 * Componente de Backend: aiController
 * ==============================================================================
 * Propósito: Centraliza la lógica de negocio para la interacción con la API de
 * Google Gemini (IA generativa), ofreciendo servicios de mejora de texto y OCR/
 * corrección multimodal.
 * Ubicación Sugerida: [...]/server/controllers/aiController.js
 */

const { GoogleGenAI } = require('@google/genai');

// 1. Validación y Obtención de la Clave API
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    /**
     * CRITICAL ERROR: La aplicación no puede iniciar sin la clave API.
     * Esto asegura que el servicio de IA no falle en tiempo de ejecución.
     */
    console.error("CRITICAL ERROR: GEMINI_API_KEY environment variable is not set.");
    throw new Error("GEMINI_API_KEY is missing. Check your .env file.");
}

// 2. Inicialización del cliente de Gemini
const ai = new GoogleGenAI({ apiKey });

/**
 * ==============================================================================
 * FUNCIÓN 1: mejorarTextoChatGPT (Modo UNIMODAL)
 * ==============================================================================
 * Descripción: Función central para mejorar o corregir texto plano usando el
 * modelo Gemini. Utiliza instrucciones de sistema (systemInstruction) dinámicas
 * según el 'modo' de la petición.
 *
 * @param {import('express').Request} req - Objeto de la petición (debe contener texto y modo).
 * @param {import('express').Response} res - Objeto de la respuesta.
 * @returns {Promise<void>} JSON con el texto mejorado o un error.
 */
const mejorarTextoChatGPT = async (req, res) => {
    // Parámetros de la petición (cuerpo)
    const { texto, modo } = req.body;

    // Validación de entrada
    if (!texto) {
        return res.status(400).json({ error: 'El campo "texto" es obligatorio.' });
    }

    try {
        let systemInstruction;
        let userPrompt;

        // Definición de las instrucciones según el modo
        if (modo === 'corregir_ortografia') {
            /** Rol: Corrector de estilo profesional. Restricción: No añadir contenido. */
            systemInstruction = "Eres un corrector de estilo y ortografía profesional. Corrige únicamente los errores gramaticales, ortográficos y de puntuación del texto proporcionado. No añadas contenido nuevo ni cambies el significado. Devuelve solo el texto corregido.";
            userPrompt = `Corrige este texto: "${texto}"`;
        } else {
            /** Modo por defecto: Mejora de redacción. Rol: Asistente de redacción experto. */
            systemInstruction = "Eres un asistente de redacción experto. Pulirás y mejorarás el texto proporcionado, asegurando claridad, cohesión y un tono profesional o adecuado para una nota rápida. No lo hagas excesivamente largo. Devuelve solo el texto mejorado.";
            userPrompt = `Mejora y pule este texto: "${texto}"`;
        }
        
        // Llamada al modelo Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-09-2025",
            contents: [{ parts: [{ text: userPrompt }] }],
            config: {
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                }
            }
        });
        
        // Extracción segura del texto de respuesta
        const improvedText = response.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar una respuesta.";

        res.json({
            textoMejorado: improvedText.trim()
        });

    } catch (error) {
        console.error("Error al interactuar con Gemini (mejorar texto):", error.message);
        // Error 500 para indicar un fallo del servicio de IA
        res.status(500).json({ error: 'Fallo en el servicio de IA. Intenta de nuevo.', details: error.message });
    }
};


/**
 * ==============================================================================
 * FUNCIÓN 2: extraerTextoImagen (Modo MULTIMODAL - OCR)
 * ==============================================================================
 * Descripción: Maneja la extracción de texto (OCR) de una imagen y su corrección
 * utilizando el modelo multimodal de Gemini. Requiere la imagen en Base64.
 *
 * @param {import('express').Request} req - Objeto de la petición (debe contener base64Image y mimeType).
 * @param {import('express').Response} res - Objeto de la respuesta.
 * @returns {Promise<void>} JSON con el texto extraído/corregido o un error.
 */
const extraerTextoImagen = async (req, res) => {
    // Parámetros de la petición (cuerpo)
    const { base64Image, mimeType } = req.body;

    // Validación de entrada
    if (!base64Image || !mimeType) {
        return res.status(400).json({ error: 'Faltan campos: base64Image y mimeType son obligatorios.' });
    }

    try {
        // 1. Creación del objeto de parte de la imagen (Multimodal)
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };

        // 2. Definición de las instrucciones para la tarea
        /** Rol: Transcriptor y corrector. Tarea: 1. Transcribir. 2. Corregir. 3. Devolver SOLO el texto final. */
        const systemInstruction = "Eres un asistente de transcripción y corrección. Tu tarea es: 1. Transcribir con precisión todo el texto que encuentres en la imagen. 2. Una vez transcrito, corrige inmediatamente los errores ortográficos, gramaticales y de puntuación del texto. **3. Devuelve *SOLO* el texto final**, corregido y transcrito, sin añadir preámbulos, explicaciones o comentarios adicionales.";
        const userPrompt = "Extrae y corrige el texto de esta imagen. Si no hay texto, indica 'No se pudo extraer texto relevante'.";
        
        // 3. Llamada a la API de Gemini (Input: Imagen + Texto)
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-09-2025", 
            contents: [
                { parts: [
                    imagePart,      // El componente de la imagen
                    { text: userPrompt } // El componente de la instrucción
                ] }
            ],
            config: {
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                }
            }
        });

        // Extracción segura del texto de respuesta
        const extractedAndCorrectedText = response.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo extraer texto relevante.";

        res.json({
            textoMejorado: extractedAndCorrectedText.trim()
        });

    } catch (error) {
        console.error("Error al interactuar con Gemini (imagen):", error.message);
        res.status(500).json({ 
            error: 'Fallo en el servicio de IA al procesar la imagen.', 
            details: error.message 
        });
    }
};


/**
 * 3. Exportación de funciones
 * Estas funciones serán importadas por las Route Handlers de Next.js o las rutas
 * de Express para manejar las peticiones.
 */
module.exports = {
    mejorarTextoChatGPT,
    extraerTextoImagen,
};