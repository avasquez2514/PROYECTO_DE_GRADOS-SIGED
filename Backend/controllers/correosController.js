/**
 * ==============================================================================
 *  Componente de Backend: mailController
 * ==============================================================================
 * Centraliza la lógica para el envío y verificación del servicio de correo SMTP.
 */

const nodemailer = require('nodemailer');

/**
 * ==============================================================================
 * FUNCIÓN 1: enviarCorreo
 * ==============================================================================
 * Envía un correo electrónico con archivos adjuntos.
 * * @param {import('express').Request} req - Requiere 'para', 'asunto', 'mensaje' en body. Puede tener req.files.
 * @param {import('express').Response} res
 */
const enviarCorreo = async (req, res) => {
    try {
        const { para, cc, asunto, mensaje, archivos_info } = req.body;
        
        // Validar campos requeridos
        if (!para || !asunto || !mensaje) {
            return res.status(400).json({
                success: false,
                message: 'Los campos para, asunto y mensaje son requeridos'
            });
        }

        // Configurar el transporter de nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Configurar los archivos adjuntos (asume middleware como Multer)
        const attachments = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                attachments.push({
                    filename: file.originalname,
                    content: file.buffer, // Contenido binario del archivo
                    contentType: file.mimetype
                });
            });
        }

        // Determinar si el mensaje contiene HTML
        const isHTML = mensaje.includes('<') && mensaje.includes('>');
        
        // Configurar el correo
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: para,
            cc: cc || undefined,
            subject: asunto,
            // Texto plano: Quita HTML si lo hay, o usa el texto crudo.
            text: isHTML ? mensaje.replace(/<[^>]*>/g, '') : mensaje, 
            // HTML: Usa el HTML si lo hay, o convierte saltos de línea a <br>.
            html: isHTML ? mensaje : mensaje.replace(/\n/g, '<br>'), 
            attachments: attachments
        };

        // Enviar el correo
        const info = await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Correo enviado exitosamente',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Error al enviar correo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al enviar el correo',
            error: error.message
        });
    }
};

/**
 * ==============================================================================
 * FUNCIÓN 2: verificarConfiguracion
 * ==============================================================================
 * Verifica la configuración y la conexión al servicio de correo SMTP.
 * * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const verificarConfiguracion = async (req, res) => {
    try {
        // 1. Verificar variables de entorno
        const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Configuración incompleta: Faltan variables de entorno SMTP',
                missingVariables: missingVars
            });
        }

        // 2. Crear transporter para la verificación
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // 3. Verificar la conexión física y la autenticación
        await transporter.verify();

        res.json({
            success: true,
            message: 'Configuración de correo verificada correctamente'
        });

    } catch (error) {
        console.error('❌ Error al verificar configuración SMTP:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar la configuración del correo (Verifique host/puerto/credenciales)',
            error: error.message
        });
    }
};

module.exports = {
    enviarCorreo,
    verificarConfiguracion
};