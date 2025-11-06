"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import "../styles/plantillas.css";

/**
 * Interfaz que define la estructura de una plantilla de notas
 * @interface Plantilla
 * @property {string} id - Identificador único de la nota
 * @property {string} plantilla_id - ID de la plantilla asociada
 * @property {string} notaPublica - Contenido de la nota pública
 * @property {string} notaInterna - Contenido de la nota interna
 */
interface Plantilla {
  id: string;
  plantilla_id: string;
  notaPublica: string;
  notaInterna: string;
}

/**
 * Props del componente PlantillaSelector
 * @interface PlantillaSelectorProps
 * @property {string} torre - Identificador de la torre para el encabezado de notas internas
 * @property {(texto: string) => void} onSelect - Función callback que se ejecuta al seleccionar o modificar texto
 */
interface PlantillaSelectorProps {
  torre: string;
  onSelect: (texto: string) => void;
}

/**
 * Componente selector de plantillas para gestión de notas públicas e internas
 * Permite seleccionar, crear, modificar, eliminar y copiar plantillas de texto
 * @component
 * @param {PlantillaSelectorProps} props - Props del componente
 * @returns {JSX.Element} Interfaz completa de selección y gestión de plantillas
 */
const PlantillaSelector: React.FC<PlantillaSelectorProps> = ({ torre, onSelect }) => {
  // --- ESTADOS DEL COMPONENTE ---
  
  /**
   * Estado que almacena las plantillas organizadas por nombre de novedad
   * @state {Record<string, Plantilla>}
   */
  const [plantillas, setPlantillas] = useState<Record<string, Plantilla>>({});
  
  /**
   * Estado para la novedad actualmente seleccionada
   * @state {string}
   */
  const [notaSeleccionada, setNotaSeleccionada] = useState("");
  
  /**
   * Estado que controla el tipo de nota a mostrar (pública o interna)
   * @state {"publica" | "interna"}
   */
  const [tipoNota, setTipoNota] = useState<"publica" | "interna">("interna");
  
  /**
   * Estado para el texto de la nota actual
   * @state {string}
   */
  const [textoNota, setTextoNota] = useState("");
  
  /**
   * Estado que indica si el texto ha sido modificado manualmente
   * @state {boolean}
   */
  const [textoModificado, setTextoModificado] = useState(false);

  /**
   * Estado que controla la visibilidad del modal de gestión
   * @state {boolean}
   */
  const [mostrarModal, setMostrarModal] = useState(false);
  
  /**
   * Estado que indica el modo de operación del modal
   * @state {"agregar" | "modificar"}
   */
  const [modoModal, setModoModal] = useState<"agregar" | "modificar">("agregar");

  /**
   * Estado para los datos del formulario del modal
   * @state {object}
   */
  const [formData, setFormData] = useState({
    novedad: "",
    nota_publica: "",
    nota_interna: "",
  });

  /**
   * URL base de la API para operaciones CRUD de notas
   * @constant {string}
   */
  const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/notas`;

  /**
   * Carga las plantillas desde la API y las organiza por nombre de novedad
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const cargarPlantillas = async () => {
    // Obtener datos de autenticación desde localStorage
    const token = localStorage.getItem("token");
    const usuarioRaw = localStorage.getItem("usuario");
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
    
    // Validar que exista autenticación
    if (!token || !usuario?.id) return;

    try {
      // Realizar petición GET a la API
      const res = await fetch(`${API}/${usuario.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Manejar errores de autenticación
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          window.location.href = "/login";
          return;
        }
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      // Validar que la respuesta sea un array
      if (!Array.isArray(data)) {
        console.error("Error: La respuesta de la API no es un array:", data);
        setPlantillas({});
        return;
      }

      // Filtrar y organizar las plantillas válidas
      const agrupadas: Record<string, Plantilla> = {};
      data.forEach((row: any) => {
        // Excluir plantillas adicionales y notas de avances
        const esPlantillaAdicional = row.plantilla?.trim();
        const esNotaAvances = row.nota_avances?.trim() && 
                             !row.nota_publica?.trim() && 
                             !row.nota_interna?.trim() && 
                             !row.plantilla?.trim();
        
        // Incluir solo notas públicas/internas regulares
        if (!esPlantillaAdicional && !esNotaAvances) {
          const novedad = row.novedad || "Sin título";
          agrupadas[novedad] = {
            id: row.id,
            plantilla_id: row.plantilla_id,
            notaPublica: row.nota_publica || "",
            notaInterna: row.nota_interna || "",
          };
        }
      });

      setPlantillas(agrupadas);
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
      setPlantillas({});
    }
  };

  /**
   * Efecto para cargar plantillas al montar el componente
   * Se ejecuta una vez al inicializar el componente
   */
  useEffect(() => {
    cargarPlantillas();
  }, []);

  /**
   * Efecto para actualizar el texto de la nota cuando cambia la selección o tipo
   * Se ejecuta cuando cambian la nota seleccionada, tipo de nota o plantillas
   */
  useEffect(() => {
    // Solo actualizar si hay una nota seleccionada y no ha sido modificada manualmente
    if (notaSeleccionada && plantillas[notaSeleccionada] && !textoModificado) {
      const encabezado = `Gestión-MOC-Torre ${torre}:`;
      const nota = tipoNota === "publica"
        ? plantillas[notaSeleccionada].notaPublica
        : `${encabezado}\n\n${plantillas[notaSeleccionada].notaInterna}`;
      setTextoNota(nota);
      onSelect(nota);
    }
  }, [notaSeleccionada, tipoNota, plantillas, torre, textoModificado, onSelect]);

  // --- MANEJADORES DE EVENTOS ---

  /**
   * Maneja el cambio de selección de nota en el dropdown
   * @function
   * @param {ChangeEvent<HTMLSelectElement>} e - Evento de cambio del select
   */
  const handleNotaChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setNotaSeleccionada(e.target.value);
    setTextoModificado(false); // Resetear flag de modificación manual
  };

  /**
   * Maneja el cambio entre tipo de nota (pública o interna)
   * @function
   * @param {"publica" | "interna"} tipo - Tipo de nota seleccionado
   */
  const handleTipoNotaChange = (tipo: "publica" | "interna") => {
    setTipoNota(tipo);
    setTextoModificado(false); // Resetear flag de modificación manual
  };

  /**
   * Maneja los cambios manuales en el textarea de la nota
   * @function
   * @param {ChangeEvent<HTMLTextAreaElement>} e - Evento de cambio del textarea
   */
  const handleTextoChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextoNota(e.target.value);
    setTextoModificado(true); // Marcar como modificado manualmente
  };

  /**
   * Copia el texto actual al portapapeles
   * @function
   */
  const copiarTexto = () => {
    navigator.clipboard.writeText(textoNota);
    alert("Texto copiado al portapapeles");
  };

  /**
   * Limpia el texto actual y notifica al componente padre
   * @function
   */
  const limpiarTexto = () => {
    setTextoNota("");
    setTextoModificado(true);
    onSelect(""); // Notificar al componente padre
  };

  // --- FUNCIONES DE GESTIÓN DE PLANTILLAS ---

  /**
   * Abre el modal en modo agregar con el formulario vacío
   * @function
   */
  const abrirModalAgregar = () => {
    setModoModal("agregar");
    setFormData({ novedad: "", nota_publica: "", nota_interna: "" });
    setMostrarModal(true);
  };

  /**
   * Abre el modal en modo modificar con los datos de la plantilla seleccionada
   * @function
   */
  const abrirModalModificar = () => {
    // Validar que haya una nota seleccionada
    if (!notaSeleccionada) {
      alert("Selecciona una nota primero");
      return;
    }
    const actual = plantillas[notaSeleccionada];
    setModoModal("modificar");
    setFormData({
      novedad: notaSeleccionada,
      nota_publica: actual.notaPublica,
      nota_interna: actual.notaInterna,
    });
    setMostrarModal(true);
  };

  /**
   * Maneja el envío del formulario del modal (agregar o modificar)
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const handleSubmitModal = async () => {
    const token = localStorage.getItem("token");
    const usuarioRaw = localStorage.getItem("usuario");
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
    
    // Validar autenticación
    if (!token || !usuario?.id) return;

    try {
      let response;
      
      if (modoModal === "agregar") {
        // Crear nombre único para evitar duplicados
        const nombreUnico = `${formData.novedad.trim()} - ${Date.now()}`;
        
        // Realizar petición POST para crear nueva plantilla
        response = await fetch(`${API}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            novedad: nombreUnico,
            nota_publica: formData.nota_publica.trim(),
            nota_interna: formData.nota_interna.trim(),
            usuario_id: usuario.id,
          }),
        });
      } else {
        // Modo modificar - obtener datos actuales
        const actual = plantillas[notaSeleccionada];
        
        // Realizar petición PUT para actualizar plantilla existente
        response = await fetch(`${API}/plantilla/${actual.plantilla_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            novedad: formData.novedad.trim(),
            nota_publica: formData.nota_publica.trim(),
            nota_interna: formData.nota_interna.trim(),
            nota_avances: "",
            plantilla: ""
          }),
        });
        // Actualizar la selección si cambió el nombre
        setNotaSeleccionada(formData.novedad.trim());
      }

      // Manejar errores de la API
      if (response && !response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          window.location.href = "/login";
          return;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`);
      }

      // Cerrar modal y recargar datos
      setMostrarModal(false);
      cargarPlantillas();
    } catch (error) {
      console.error("Error al guardar/editar:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al guardar plantilla: ${errorMessage}`);
    }
  };

  /**
   * Elimina la plantilla seleccionada con confirmación del usuario
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const eliminarPlantilla = async () => {
    // Validar que haya una nota seleccionada
    if (!notaSeleccionada) {
      alert("Selecciona una nota primero");
      return;
    }
    
    const id = plantillas[notaSeleccionada].id;
    const token = localStorage.getItem("token");
    if (!token) return;

    // Confirmación de eliminación
    if (!window.confirm(`¿Eliminar plantilla "${notaSeleccionada}"?`)) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Manejar errores de la API
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
          window.location.href = "/login";
          return;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`);
      }

      // Limpiar estados y recargar datos
      setNotaSeleccionada("");
      setTextoNota("");
      onSelect("");
      cargarPlantillas();
    } catch (error) {
      console.error("❌ Error al eliminar plantilla:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al eliminar plantilla: ${errorMessage}`);
    }
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="plantilla-container">
      <div className="plantilla-card">
        {/* Header con icono, título y subtítulo */}
        <div className="plantilla-header">
          <span className="plantilla-header-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </span>
          <div className="plantilla-header-text">
            <h2 className="plantilla-title">Selecciona Nota</h2>
            <p className="plantilla-subtitle">Gestiona y personaliza tus notas</p>
          </div>
        </div>

        {/* Label Categoría */}
        <div className="plantilla-categoria-label">
          <span className="categoria-bullet">•</span> Categoría
        </div>

        {/* Dropdown para seleccionar nota */}
        <select value={notaSeleccionada} onChange={handleNotaChange} className="plantilla-select">
          <option value="">-- Selecciona una nota --</option>
          {Object.keys(plantillas).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        {/* Botones de Acción Superior (Agregar, Modificar, Eliminar) */}
        <div className="plantilla-buttons-top">
          {/* Botón Agregar */}
          <button className="plantilla-button agregar" onClick={abrirModalAgregar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Agregar
          </button>
          {/* Botón Modificar */}
          <button className="plantilla-button modificar" onClick={abrirModalModificar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Modificar
          </button>
          {/* Botón Eliminar */}
          <button className="plantilla-button eliminar" onClick={eliminarPlantilla}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Eliminar
          </button>
        </div>

        {/* Textarea para edición de notas - SIEMPRE VISIBLE */}
        <textarea
          rows={6}
          value={textoNota}
          onChange={handleTextoChange}
          className="plantilla-textarea"
          placeholder="Escribe tu nota aquí..."
        />

        {/* Botones para seleccionar tipo de nota */}
        <div className="plantilla-buttons">
          {/* Botón Nota Interna */}
          <button
            className={`plantilla-button interna ${tipoNota === "interna" ? "active" : ""}`}
            onClick={() => handleTipoNotaChange("interna")}
          >
            Nota Interna
          </button>
          {/* Botón Nota Pública */}
          <button
            className={`plantilla-button publica ${tipoNota === "publica" ? "active" : ""}`}
            onClick={() => handleTipoNotaChange("publica")}
          >
            Nota Pública
          </button>
        </div>

        {/* Botones de utilidad (Copiar y Limpiar) */}
        <div className="plantilla-buttons">
          {/* Botón Copiar */}
          <button className="plantilla-button copy" onClick={copiarTexto}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copiar
          </button>
          {/* Botón Limpiar */}
          <button className="plantilla-button clear" onClick={limpiarTexto}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
            </svg>
            Limpiar
          </button>
        </div>

        {/* Footer: Indicador del tipo de nota seleccionado */}
        <p className="plantilla-tipo-seleccionado">
          Tipo seleccionado: <span className="plantilla-tipo-valor">{tipoNota === "publica" ? "Nota Pública" : "Nota Interna"}</span>
        </p>
      </div>

      {/* Modal para agregar/modificar plantillas */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="modal-header">
              <h2>{modoModal === "agregar" ? "Agregar Plantilla" : "Modificar Plantilla"}</h2>
              {/* Botón para cerrar modal */}
              <button className="modal-close-btn" onClick={() => setMostrarModal(false)}>
                ×
              </button>
            </div>

            {/* Cuerpo del modal con formulario */}
            <div className="modal-body">
              {/* Campo Nombre de la novedad */}
              <label>Novedad:</label>
              <input
                value={formData.novedad}
                onChange={(e) => setFormData({ ...formData, novedad: e.target.value })}
                placeholder="Nombre de la plantilla..."
              />

              {/* Campo Nota Pública */}
              <label>Nota Pública:</label>
              <textarea
                rows={3}
                value={formData.nota_publica}
                onChange={(e) => setFormData({ ...formData, nota_publica: e.target.value })}
                placeholder="Contenido de la nota pública..."
              />

              {/* Campo Nota Interna */}
              <label>Nota Interna:</label>
              <textarea
                rows={3}
                value={formData.nota_interna}
                onChange={(e) => setFormData({ ...formData, nota_interna: e.target.value })}
                placeholder="Contenido de la nota interna..."
              />
            </div>

            {/* Footer del modal con botones de acción */}
            <div className="modal-buttons">
              {/* Botón Guardar/Actualizar */}
              <button onClick={handleSubmitModal} className="modal-save-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {modoModal === "agregar" ? "Guardar" : "Actualizar"}
              </button>

              {/* Botón Eliminar (solo en modo modificar) */}
              {modoModal === "modificar" && (
                <button onClick={eliminarPlantilla} className="modal-delete-button">
                  <FaTrash style={{ marginRight: "8px" }} /> Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantillaSelector;