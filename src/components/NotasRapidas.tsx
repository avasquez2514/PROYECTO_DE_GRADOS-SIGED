"use client";

import React, { useState, useEffect, useCallback } from "react";
import "../styles/notasRapidas.css";

/**
 * Interfaz que define la estructura de una nota rápida
 * @interface Nota
 * @property {string} id - Identificador único de la nota
 * @property {string} titulo - Título descriptivo de la nota
 * @property {string} contenido - Contenido textual de la nota
 * @property {string} fechaCreacion - Fecha de creación en formato ISO
 * @property {string} fechaModificacion - Fecha de última modificación en formato ISO
 */
interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  fechaCreacion: string;
  fechaModificacion: string;
}

/**
 * Tiempo de espera predeterminado para las peticiones fetch (15 segundos)
 * @constant {number}
 */
const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Función wrapper para fetch con timeout que evita peticiones eternas
 * @async
 * @function
 * @param {string} url - URL a la que hacer la petición
 * @param {RequestInit} [options={}] - Opciones de configuración de fetch
 * @param {number} [timeout=DEFAULT_TIMEOUT_MS] - Tiempo máximo de espera en milisegundos
 * @returns {Promise<Response>} Respuesta de la petición fetch
 * @throws {Error} Error si la petición es abortada por timeout o falla
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = DEFAULT_TIMEOUT_MS
) => {
  // Crear controlador para poder abortar la petición
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

/**
 * Extrae texto mejorado de diferentes formatos de respuesta de IA
 * @function
 * @param {any} data - Datos de respuesta de la API de IA
 * @returns {string | null} Texto extraído o null si no se pudo extraer
 */
const extractImprovedText = (data: any): string | null => {
  if (!data) return null;
  // Diferentes formatos de respuesta que pueden venir de la IA
  if (typeof data === "string") return data;
  if (data.textoMejorado) return data.textoMejorado;
  if (data.text) return data.text;
  if (data.result && typeof data.result === "string") return data.result;
  if (data.result?.texto) return data.result.texto;
  if (data.content) return data.content;
  // Formato de OpenAI API
  if (data.choices && Array.isArray(data.choices)) {
    const first = data.choices[0];
    if (first) {
      if (first.message?.content) return first.message.content;
      if (first.text) return first.text;
    }
  }
  if (data.output) return data.output;
  return null;
};

/**
 * Componente principal para gestión de notas rápidas con funcionalidades de IA
 * Permite crear, editar, eliminar notas y mejorarlas con inteligencia artificial
 * @component
 * @returns {JSX.Element} Interfaz completa de gestión de notas rápidas
 */
const NotasRapidas: React.FC = () => {
  // --- ESTADOS DEL COMPONENTE ---
  
  /**
   * Estado que almacena la lista completa de notas
   * @state {Nota[]}
   */
  const [notas, setNotas] = useState<Nota[]>([]);
  
  /**
   * Estado que almacena la nota actualmente seleccionada
   * @state {Nota | null}
   */
  const [notaActual, setNotaActual] = useState<Nota | null>(null);
  
  /**
   * Estado para el título de la nota en edición
   * @state {string}
   */
  const [titulo, setTitulo] = useState("");
  
  /**
   * Estado para el contenido de la nota en edición
   * @state {string}
   */
  const [contenido, setContenido] = useState("");
  
  /**
   * Estado que indica si se está procesando una petición de IA
   * @state {boolean}
   */
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Estado que controla la visibilidad del modal de sugerencias de IA
   * @state {boolean}
   */
  const [showAIModal, setShowAIModal] = useState(false);
  
  /**
   * Estado que almacena la sugerencia de texto mejorado por IA
   * @state {string}
   */
  const [aiSuggestion, setAiSuggestion] = useState("");
  
  /**
   * Estado que indica si se acaba de guardar una nota exitosamente
   * @state {boolean}
   */
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  
  /**
   * Estado que indica si se está corrigiendo la ortografía automáticamente
   * @state {boolean}
   */
  const [corrigiendoTodo, setCorrigiendoTodo] = useState(false);
  
  /**
   * Estado que indica si las notas ya fueron cargadas desde localStorage
   * @state {boolean}
   */
  const [notasCargadas, setNotasCargadas] = useState(false);

  // --- EFECTOS DE PERSISTENCIA ---

  /**
   * Efecto para cargar notas desde localStorage al montar el componente
   * Se ejecuta una vez al inicializar el componente
   */
  useEffect(() => {
    try {
      const notasGuardadas = localStorage.getItem("notasRapidas");
      if (notasGuardadas) {
        const notasParseadas = JSON.parse(notasGuardadas);
        // Validar que sea un array antes de establecer el estado
        if (Array.isArray(notasParseadas)) {
          setNotas(notasParseadas);
        }
      }
      setNotasCargadas(true);
    } catch (error) {
      console.error("Error al cargar notas del localStorage:", error);
      setNotas([]);
      setNotasCargadas(true);
    }
  }, []);

  /**
   * Efecto para guardar notas en localStorage cuando cambian
   * Solo se ejecuta después de que las notas han sido cargadas inicialmente
   */
  useEffect(() => {
    if (notasCargadas) {
      try {
        localStorage.setItem("notasRapidas", JSON.stringify(notas));
      } catch (error) {
        console.error("Error al guardar notas en localStorage:", error);
      }
    }
  }, [notas, notasCargadas]);

  // --- FUNCIONES DE GESTIÓN DE NOTAS ---

  /**
   * Crea una nueva nota vacía y la agrega a la lista
   * @function
   */
  const crearNuevaNota = () => {
    const nuevaNota: Nota = {
      id: Date.now().toString(), // Usar timestamp como ID único
      titulo: "Nueva Nota",
      contenido: "",
      fechaCreacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString(),
    };
    setNotas(prev => [nuevaNota, ...prev]); // Agregar al inicio de la lista
    setNotaActual(nuevaNota);
    setTitulo("Nueva Nota");
    setContenido("");
  };

  /**
   * Guarda la nota actual en el estado y localStorage
   * @function
   * @callback
   */
  const guardarNota = useCallback(() => {
    if (!notaActual) return;

    // Crear objeto de nota actualizada
    const notaActualizada: Nota = {
      ...notaActual,
      titulo: titulo || "Sin título", // Usar "Sin título" si está vacío
      contenido,
      fechaModificacion: new Date().toISOString(), // Actualizar timestamp
    };

    let nuevasNotas: Nota[];
    // Actualizar nota existente o agregar nueva
    if (notas.find(n => n.id === notaActualizada.id)) {
      nuevasNotas = notas.map(n => n.id === notaActualizada.id ? notaActualizada : n);
    } else {
      nuevasNotas = [...notas, notaActualizada];
    }

    // Actualizar estados
    setNotas(nuevasNotas);
    setNotaActual(notaActualizada);
    
    // Guardar inmediatamente en localStorage
    try {
      localStorage.setItem("notasRapidas", JSON.stringify(nuevasNotas));
    } catch (error) {
      console.error("Error al guardar inmediatamente:", error);
    }
    
    // Mostrar indicador de guardado exitoso
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 2000);
  }, [notaActual, titulo, contenido, notas]);

  /**
   * Efecto para guardado automático cada 30 segundos cuando hay cambios
   * Se ejecuta cuando cambian la nota actual, título o contenido
   */
  useEffect(() => {
    if (notaActual && (titulo || contenido)) {
      const interval = setInterval(() => {
        guardarNota();
      }, 30000); // Guardar automáticamente cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [notaActual, titulo, contenido, guardarNota]);

  /**
   * Selecciona una nota para edición
   * @function
   * @param {Nota} nota - Nota a seleccionar
   */
  const seleccionarNota = (nota: Nota) => {
    setNotaActual(nota);
    setTitulo(nota.titulo);
    setContenido(nota.contenido);
  };

  /**
   * Elimina una nota de la lista
   * @function
   * @param {string} id - ID de la nota a eliminar
   */
  const eliminarNota = (id: string) => {
    setNotas(prev => prev.filter(n => n.id !== id));
    // Si la nota eliminada es la actual, limpiar el editor
    if (notaActual?.id === id) {
      setNotaActual(null);
      setTitulo("");
      setContenido("");
    }
  };

  // --- FUNCIONES DE INTELIGENCIA ARTIFICIAL ---

  /**
   * Mejora el contenido de la nota actual usando IA
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const mejorarConIA = async () => {
    if (!contenido.trim()) return;

    setIsLoading(true);
    try {
      // Realizar petición al endpoint de mejora de texto
      const res = await fetchWithTimeout(
        "/api/ia/mejorar-texto-chatgpt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: contenido }),
        },
        DEFAULT_TIMEOUT_MS
      );

      // Manejar errores HTTP
      if (!res.ok) {
        console.error("mejorarConIA status:", res.status);
        alert("Error al procesar el texto (server). Intenta de nuevo.");
        return;
      }

      const data = await res.json();
      const improved = extractImprovedText(data);
      
      // Validar que se recibió texto mejorado
      if (!improved) {
        alert("La respuesta de la IA no contiene texto mejorado.");
        console.error("Respuesta IA inesperada:", data);
        return;
      }

      // Mostrar sugerencia en modal
      setAiSuggestion(improved);
      setShowAIModal(true);
    } catch (err: any) {
      // Manejar diferentes tipos de errores
      if (err.name === "AbortError") {
        alert("La solicitud a la IA tardó demasiado y fue cancelada. Intenta nuevamente.");
      } else {
        console.error("mejorarConIA error:", err);
        alert("Error al conectar con el servicio de IA.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Aplica la sugerencia de IA al contenido actual
   * @function
   */
  const aplicarSugerenciaIA = () => {
    setContenido(aiSuggestion);
    setShowAIModal(false);
    setAiSuggestion("");
  };

  /**
   * Corrige automáticamente la ortografía del contenido usando IA
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const corregirOrtografiaAutomatica = async () => {
    if (!contenido.trim()) return;

    setCorrigiendoTodo(true);
    try {
      const res = await fetchWithTimeout(
        "/api/ia/mejorar-texto-chatgpt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: contenido, modo: "corregir_ortografia" }),
        },
        DEFAULT_TIMEOUT_MS
      );

      if (!res.ok) {
        console.error("corregirOrtografiaAutomatica status:", res.status);
        alert("Error al corregir ortografía (server). Intenta de nuevo.");
        return;
      }

      const data = await res.json();
      const improved = extractImprovedText(data);
      
      if (!improved) {
        alert("La respuesta de la IA no contiene el texto corregido.");
        console.error("Respuesta IA inesperada:", data);
        return;
      }

      // Aplicar corrección directamente al contenido
      setContenido(improved);
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 2000);
    } catch (err: any) {
      if (err.name === "AbortError") {
        alert("La solicitud a la IA tardó demasiado y fue cancelada. Intenta nuevamente.");
      } else {
        console.error("corregirOrtografiaAutomatica error:", err);
        alert("Error al conectar con el servicio de IA.");
      }
    } finally {
      setCorrigiendoTodo(false);
    }
  };

  // --- FUNCIONES DE PROCESAMIENTO DE IMÁGENES ---

  /**
   * Maneja la carga de imágenes para extraer texto (OCR)
   * @function
   * @param {React.ChangeEvent<HTMLInputElement>} event - Evento de cambio del input file
   */
  const manejarCargaImagen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Validar que sea una imagen
    if (file && file.type.startsWith("image/")) {
      extraerYCorregirTextoDeImagen(file);
    } else if (file) {
      alert("Por favor, selecciona un archivo de imagen válido (JPEG, PNG).");
    }
    // Limpiar input para permitir seleccionar el mismo archivo otra vez
    event.target.value = '';
  };

  /**
   * Extrae y corrige texto de una imagen usando OCR e IA
   * @async
   * @function
   * @param {File} file - Archivo de imagen a procesar
   * @returns {Promise<void>}
   */
  const extraerYCorregirTextoDeImagen = async (file: File) => {
    setIsLoading(true);
    try {
      // Convertir imagen a base64 para enviar al servidor
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1]; // Remover prefijo data URL
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Realizar petición de OCR con timeout extendido (60 segundos)
      const res = await fetchWithTimeout(
        "/api/ia/extraer-texto-imagen",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            base64Image: base64Image,
            mimeType: file.type 
          }),
        },
        60000 // Timeout extendido para procesamiento de imágenes
      );

      if (!res.ok) {
        console.error("extraerYCorregirTextoDeImagen status:", res.status);
        alert("Error al procesar la imagen (server). Intenta de nuevo.");
        return;
      }

      const data = await res.json();
      const improved = extractImprovedText(data);

      // Validar y aplicar texto extraído
      if (improved && improved.trim() !== 'No se pudo extraer texto relevante') {
        setContenido(prev => (prev.trim() ? prev + "\n\n---\n\n" : "") + improved);
      } else {
        alert("La IA no pudo extraer texto relevante de la imagen.");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        alert("El procesamiento de la imagen tardó demasiado y fue cancelado. Intenta nuevamente.");
      } else {
        console.error("extraerYCorregirTextoDeImagen error:", err);
        alert("Error al conectar con el servicio de IA o al procesar la imagen.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNCIONES DE IMPORTACIÓN/EXPORTACIÓN ---

  /**
   * Exporta todas las notas como archivo JSON descargable
   * @function
   */
  const exportarNotas = () => {
    try {
      const dataStr = JSON.stringify(notas, null, 2); // Formatear JSON con indentación
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      // Nombre del archivo con fecha actual
      link.download = `notas-rapidas-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Liberar memoria
    } catch (error) {
      console.error("Error al exportar notas:", error);
      alert("Error al exportar las notas");
    }
  };

  /**
   * Importa notas desde un archivo JSON
   * @function
   * @param {React.ChangeEvent<HTMLInputElement>} event - Evento de cambio del input file
   */
  const importarNotas = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const contenido = e.target?.result as string;
        const notasImportadas = JSON.parse(contenido);
        
        // Validar estructura del archivo importado
        if (Array.isArray(notasImportadas)) {
          const notasValidas = notasImportadas.filter(
            (n: any) => n.id && n.titulo && n.contenido // Validar campos requeridos
          );
          setNotas(prev => [...prev, ...notasValidas]); // Combinar con notas existentes
          alert(`Se importaron ${notasValidas.length} notas exitosamente`);
        } else {
          alert("El archivo no contiene un formato válido de notas");
        }
      } catch (error) {
        console.error("Error al importar notas:", error);
        alert("Error al importar las notas. Verifica que el archivo sea válido.");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Limpiar input
  };

  /**
   * Elimina todas las notas con confirmación del usuario
   * @function
   */
  const limpiarTodasLasNotas = () => {
    if (confirm("¿Estás seguro de que quieres eliminar todas las notas? Esta acción no se puede deshacer.")) {
      setNotas([]);
      setNotaActual(null);
      setTitulo("");
      setContenido("");
      localStorage.removeItem("notasRapidas");
    }
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="notas-rapidas-container">
      {/* Header principal con título y acciones globales */}
      <div className="notas-header">
        <h2>
          <span className="notas-header-icon">📝</span>
          Notas Rápidas
        </h2>
        <div className="notas-actions">
          {/* Botón para crear nueva nota */}
          <button onClick={crearNuevaNota} className="btn-nueva-nota">
            + Nueva Nota
          </button>
          {/* Botón para exportar notas */}
          <button onClick={exportarNotas} className="btn-exportar" title="Exportar notas">
            📤 Exportar
          </button>
          {/* Input oculto para importar notas */}
          <label className="btn-importar" title="Importar notas">
            📥 Importar
            <input
              type="file"
              accept=".json"
              onChange={importarNotas}
              style={{ display: 'none' }}
            />
          </label>
          {/* Botón para limpiar todas las notas */}
          <button onClick={limpiarTodasLasNotas} className="btn-limpiar" title="Limpiar todas las notas">
            🗑️ Limpiar
          </button>
          {/* Indicador visual de guardado exitoso */}
          {guardadoExitoso && (
            <span className="guardado-indicator">✅ Guardado</span>
          )}
        </div>
      </div>

      {/* Layout principal dividido en lista y editor */}
      <div className="notas-layout">
        {/* Panel lateral con lista de notas */}
        <div className="notas-lista">
          <h3>Lista de Notas</h3>
          <div className="notas-list">
            {/* Ordenar notas por fecha de modificación (más recientes primero) */}
            {notas.sort((a, b) => new Date(b.fechaModificacion).getTime() - new Date(a.fechaModificacion).getTime())
              .map((nota) => (
                <div
                  key={nota.id}
                  className={`nota-item ${notaActual?.id === nota.id ? 'active' : ''}`}
                  onClick={() => seleccionarNota(nota)}
                >
                  <div className="nota-titulo">{nota.titulo}</div>
                  <div className="nota-fecha">
                    Modificado: {new Date(nota.fechaModificacion).toLocaleDateString()}
                  </div>
                  {/* Botón para eliminar nota individual */}
                  <button className="btn-eliminar" onClick={(e) => { e.stopPropagation(); eliminarNota(nota.id); }}>
                    🗑️
                  </button>
                </div>
            ))}
          </div>
        </div>

        {/* Panel principal del editor de notas */}
        <div className="notas-editor">
          <h2>EDITOR DE NOTAS</h2>
          {notaActual ? (
            <div className="editor-container">
              <div className="editor-header">
                {/* Input para el título de la nota */}
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Título de la nota..."
                  className="titulo-input"
                />
                <div className="editor-actions">
                  {/* Botón para extraer texto de imagen (OCR) */}
                  <label className={`btn-upload-image ${isLoading ? 'disabled' : ''}`} title="Extraer texto de imagen (OCR + Corrección)">
                    {isLoading ? "⏳ Procesando..." : "🖼️ Imagen a Texto"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={manejarCargaImagen}
                      disabled={isLoading || corrigiendoTodo}
                      style={{ display: 'none' }}
                    />
                  </label>
                  
                  {/* Botón para mejorar texto con IA */}
                  <button
                    onClick={mejorarConIA}
                    disabled={!contenido.trim() || isLoading || corrigiendoTodo}
                    className="btn-ia"
                  >
                    {isLoading ? "⏳" : "🤖"} Mejorar con IA
                  </button>
                  {/* Botón para corrección automática de ortografía */}
                  <button
                    onClick={corregirOrtografiaAutomatica}
                    disabled={!contenido.trim() || isLoading || corrigiendoTodo}
                    className="btn-corregir-auto"
                  >
                    {corrigiendoTodo ? "⏳" : "✨"} Corregir Ortografía
                  </button>
                  {/* Botón para guardado manual */}
                  <button onClick={guardarNota} className="btn-guardar" disabled={isLoading || corrigiendoTodo}>
                    💾 Guardar
                  </button>
                </div>
              </div>
              {/* Textarea principal para el contenido de la nota */}
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Escribe tu nota aquí..."
                className="contenido-textarea"
                rows={15}
              />
            </div>
          ) : (
            /* Estado cuando no hay nota seleccionada */
            <div className="no-nota-seleccionada">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <p>Selecciona una nota existente o crea una nueva</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para mostrar sugerencias de IA */}
      {showAIModal && (
        <div className="modal-overlay" onClick={() => setShowAIModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sugerencia de Redacción con IA</h3>
              <button className="btn-cerrar" onClick={() => setShowAIModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {/* Sección de texto original */}
              <div className="texto-original">
                <h4>Texto Original:</h4>
                <p>{contenido}</p>
              </div>
              {/* Sección de texto mejorado por IA */}
              <div className="texto-mejorado">
                <h4>Texto Mejorado (IA):</h4>
                <p>{aiSuggestion}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setShowAIModal(false)}>
                Cancelar
              </button>
              <button className="btn-aplicar" onClick={aplicarSugerenciaIA}>
                Aplicar Sugerencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotasRapidas;