"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import "../styles/plantillasAdicionales.css";
import Modal from "./Modal";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

/**
 * Interfaz que define la estructura de una plantilla adicional
 * @interface Plantilla
 * @property {string} id - Identificador único de la plantilla
 * @property {string} [relacionId] - ID de relación opcional con otras entidades
 * @property {string} nombre - Nombre descriptivo de la plantilla
 * @property {string} texto - Contenido textual de la plantilla
 */
interface Plantilla {
  id: string;
  relacionId?: string;
  nombre: string;
  texto: string;
}

/**
 * Props del componente PlantillasAdicionales
 * @interface PlantillasAdicionalesProps
 * @property {string} torre - Identificador de la torre (actualmente no utilizado pero disponible para futuras extensiones)
 */
interface PlantillasAdicionalesProps {
  torre: string;
}

/**
 * Clave para almacenar el orden de plantillas en localStorage
 * @constant {string}
 */
const STORAGE_KEY = "plantillasAdicionalesOrden";

// --- COMPONENTES DE ICONOS SVG ---

/**
 * Icono de documento de texto
 * @component
 * @returns {JSX.Element} Icono SVG de documento
 */
const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

/**
 * Icono de suma/agregar
 * @component
 * @returns {JSX.Element} Icono SVG de suma
 */
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

/**
 * Componente principal para gestionar plantillas de texto adicionales
 * Permite crear, editar, eliminar, copiar y reordenar plantillas mediante drag & drop
 * @component
 * @param {PlantillasAdicionalesProps} props - Props del componente
 * @returns {JSX.Element} Interfaz completa de gestión de plantillas
 */
const PlantillasAdicionales: React.FC<PlantillasAdicionalesProps> = ({ torre }) => {
  // --- ESTADOS DEL COMPONENTE ---
  
  /**
   * Estado que almacena la lista completa de plantillas
   * @state {Plantilla[]}
   */
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  
  /**
   * Estado que almacena el orden de las plantillas para persistencia
   * @state {string[]}
   */
  const [ordenPlantillas, setOrdenPlantillas] = useState<string[]>([]);
  
  /**
   * Estado que controla la visibilidad del modal de edición
   * @state {boolean}
   */
  const [modalOpen, setModalOpen] = useState(false);
  
  /**
   * Estado que indica el modo de operación del modal (agregar o editar)
   * @state {"agregar" | "editar"}
   */
  const [modo, setModo] = useState<"agregar" | "editar">("agregar");
  
  /**
   * Estado que indica si se están cargando datos desde la API
   * @state {boolean}
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * Estado que controla la visibilidad del formulario de nueva plantilla
   * @state {boolean}
   */
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  /**
   * Estado para los datos del formulario de plantilla
   * @state {object}
   */
  const [formData, setFormData] = useState<{
    id: string | null;
    relacionId: string | null;
    nombre: string;
    texto: string;
  }>({ id: null, relacionId: null, nombre: "", texto: "" });

  /**
   * URL base de la API para operaciones CRUD de plantillas
   * @constant {string}
   */
  const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/notas`;

  /**
   * Carga las plantillas desde la API y sincroniza con el orden guardado
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
      setLoading(true);

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
        setPlantillas([]);
        setOrdenPlantillas([]);
        return;
      }

      // Filtrar y mapear las plantillas válidas
      const filtradas: Plantilla[] = data
        .filter(
          (nota: any) =>
            nota.plantilla?.trim() && // Debe tener contenido en plantilla
            !nota.nota_publica?.trim() && // No debe tener nota pública
            !nota.nota_interna?.trim() && // No debe tener nota interna
            !nota.nota_avances?.trim() // No debe tener nota de avances
        )
        .map((nota: any) => ({
          id: nota.plantilla_id,
          relacionId: nota.id,
          nombre: nota.novedad || "Sin título", // Usar "Sin título" como fallback
          texto: nota.plantilla,
        }));

      setPlantillas(filtradas);

      // Cargar orden guardado o establecer orden por defecto
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const ordenGuardada = JSON.parse(guardado) as string[];
        // Agregar nuevas plantillas al final del orden existente
        const nuevasPlantillas = filtradas
          .map((p) => p.id)
          .filter((id) => !ordenGuardada.includes(id));
        setOrdenPlantillas([...ordenGuardada, ...nuevasPlantillas]);
      } else {
        // Establecer orden inicial basado en la respuesta de la API
        setOrdenPlantillas(filtradas.map((p: Plantilla) => p.id));
      }
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
      setPlantillas([]);
      setOrdenPlantillas([]);
    } finally {
      setLoading(false);
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
   * Efecto para persistir el orden de plantillas en localStorage
   * Se ejecuta cuando cambia el orden de plantillas
   */
  useEffect(() => {
    if (ordenPlantillas.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ordenPlantillas));
    }
  }, [ordenPlantillas]);

  // --- FUNCIONES DE GESTIÓN DE PLANTILLAS ---

  /**
   * Copia el texto de una plantilla al portapapeles
   * @function
   * @param {string} texto - Texto de la plantilla a copiar
   */
  const copiarPlantilla = (texto: string) => {
    navigator.clipboard.writeText(texto)
      .catch((err) => console.error("Error al copiar: ", err));
  };

  /**
   * Elimina una plantilla con confirmación del usuario
   * @async
   * @function
   * @param {string | null} plantillaId - ID de la plantilla a eliminar
   * @returns {Promise<void>}
   */
  const eliminarPlantilla = async (plantillaId: string | null) => {
    if (!plantillaId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    // Confirmación de eliminación
    if (!window.confirm("¿Estás seguro de eliminar esta plantilla?")) return;

    try {
      const response = await fetch(`${API}/plantilla/${plantillaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Manejar errores de autenticación
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

      const result = await response.json();
      console.log("✅ Plantilla eliminada:", result.mensaje);
      
      // Recargar la lista de plantillas
      await cargarPlantillas();
    } catch (error) {
      console.error("❌ Error al eliminar plantilla:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al eliminar plantilla: ${errorMessage}`);
    }
  };

  /**
   * Abre el formulario para agregar una nueva plantilla
   * @function
   */
  const abrirFormularioAgregar = () => {
    setFormData({ id: null, relacionId: null, nombre: "", texto: "" });
    setMostrarFormulario(true);
  };

  /**
   * Abre el modal para editar una plantilla existente
   * @function
   * @param {Plantilla} plantilla - Plantilla a editar
   */
  const abrirModalEditar = (plantilla: Plantilla) => {
    setModo("editar");
    setFormData({
      id: plantilla.id,
      relacionId: plantilla.relacionId || null,
      nombre: plantilla.nombre,
      texto: plantilla.texto,
    });
    setModalOpen(true);
  };

  /**
   * Maneja los cambios en los campos del formulario
   * @function
   * @param {ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>} e - Evento de cambio
   */
  const manejarCambio = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Agrega una nueva plantilla a través de la API
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const agregarPlantilla = async () => {
    const token = localStorage.getItem("token");
    const usuarioRaw = localStorage.getItem("usuario");
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

    // Validar autenticación y datos requeridos
    if (!token || !usuario?.id) return;
    if (!formData.nombre.trim() || !formData.texto.trim()) return;

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          novedad: formData.nombre,
          plantilla: formData.texto,
          usuario_id: usuario.id,
        }),
      });

      // Manejar errores de autenticación
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

      // Limpiar formulario y recargar plantillas
      setMostrarFormulario(false);
      setFormData({ id: null, relacionId: null, nombre: "", texto: "" });
      await cargarPlantillas();
    } catch (error) {
      console.error("Error al agregar plantilla:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al agregar plantilla: ${errorMessage}`);
    }
  };

  /**
   * Guarda los cambios de una plantilla editada a través de la API
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const guardarPlantillaModal = async () => {
    const token = localStorage.getItem("token");

    // Validar autenticación y datos requeridos
    if (!token || !formData.id) return;
    if (!formData.nombre.trim() || !formData.texto.trim()) return;

    try {
      const response = await fetch(`${API}/plantilla/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          novedad: formData.nombre,
          plantilla: formData.texto,
        }),
      });

      // Manejar errores de autenticación
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

      setModalOpen(false);
      await cargarPlantillas();
    } catch (error) {
      console.error("Error al guardar plantilla:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al guardar plantilla: ${errorMessage}`);
    }
  };

  /**
   * Maneja el evento de drag & drop para reordenar plantillas
   * @function
   * @param {DropResult} result - Resultado del drag & drop
   */
  const onDragEnd = (result: DropResult) => {
    // Validar que haya un destino válido
    if (!result.destination) return;
    
    // Obtener índices de origen y destino
    const items = Array.from(ordenPlantillas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Actualizar el estado con el nuevo orden
    setOrdenPlantillas(items);
  };

  /**
   * Calcula las plantillas ordenadas según el estado de ordenPlantillas
   * @type {Plantilla[]}
   */
  const plantillasOrdenadas = ordenPlantillas
    .map(id => plantillas.find((p: Plantilla) => p.id === id))
    .filter(Boolean) as Plantilla[];

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="plantilla-containerr">
      <div className="plantilla-content">
        {/* Header del componente */}
        <div className="plantilla-header">
          <div className="plantilla-title-section">
            {/* Icono principal */}
            <div className="plantilla-icon">
              <FileTextIcon />
            </div>
            {/* Título y descripción */}
            <div className="plantilla-title-text">
              <h1>Plantillas Adicionales</h1>
              <p>Gestiona tus plantillas de texto personalizadas</p>
            </div>
          </div>
          
          {/* Botón para agregar nueva plantilla */}
          <button className="agregar-button" onClick={abrirFormularioAgregar}>
            <PlusIcon />
            Agregar Plantilla
          </button>
        </div>

        {/* Formulario inline para nueva plantilla */}
        {mostrarFormulario && (
          <div className="plantilla-formulario">
            {/* Input para el nombre de la plantilla */}
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={manejarCambio}
              placeholder="Título de la plantilla..."
            />
            {/* Textarea para el contenido de la plantilla */}
            <textarea
              name="texto"
              value={formData.texto}
              onChange={manejarCambio}
              placeholder="Contenido de la plantilla..."
              rows={5}
            />
            {/* Botones del formulario */}
            <div className="plantilla-formulario-botones">
              <button onClick={agregarPlantilla} className="btn-guardar">
                Guardar Plantilla
              </button>
              <button
                onClick={() => {
                  setMostrarFormulario(false);
                  setFormData({ id: null, relacionId: null, nombre: "", texto: "" });
                }}
                className="btn-cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Indicador de carga */}
        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
            ⏳ Cargando plantillas...
          </p>
        ) : (
          <>
            {/* Lista de plantillas con funcionalidad de drag & drop */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="plantillas-list">
                {(provided) => (
                  <div
                    className="plantilla-list"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {plantillasOrdenadas.map((plantilla, index) => (
                      <Draggable key={plantilla.id} draggableId={plantilla.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            className={`plantilla-item ${snapshot.isDragging ? 'dragging' : ''}`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {/* Contenido de la plantilla */}
                            <div className="plantilla-contenido">
                              <h3 className="plantilla-nombre">{plantilla.nombre}</h3>
                              <p className="plantilla-texto">{plantilla.texto}</p>
                            </div>
                            {/* Botones de acción para cada plantilla */}
                            <div className="plantilla-buttons">
                              {/* Botón copiar */}
                              <button
                                className="plantilla-button copy"
                                onClick={() => copiarPlantilla(plantilla.texto)}
                                title="Copiar"
                              >
                                📋 Copiar
                              </button>
                              {/* Botón modificar */}
                              <button
                                className="plantilla-button edit"
                                onClick={() => abrirModalEditar(plantilla)}
                                title="Modificar"
                              >
                                ✏️ Modificar
                              </button>
                              {/* Botón eliminar */}
                              <button
                                className="plantilla-button clear"
                                onClick={() => eliminarPlantilla(plantilla.id)}
                                title="Eliminar"
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Estado vacío cuando no hay plantillas */}
            {plantillasOrdenadas.length === 0 && (
              <div className="empty-state">
                <FileTextIcon />
                <p>No hay plantillas disponibles</p>
                <p>Haz clic en "Agregar Plantilla" para crear una nueva</p>
              </div>
            )}

            {/* Footer con contador de plantillas */}
            <div className="plantilla-footer">
              <p>
                Total de plantillas: <span>{plantillasOrdenadas.length}</span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modal para editar plantillas */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h2>Modificar Plantilla</h2>

        {/* Campo para el título de la plantilla */}
        <label>Título</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={manejarCambio}
        />

        {/* Campo para el contenido de la plantilla */}
        <label>Contenido</label>
        <textarea
          rows={5}
          name="texto"
          value={formData.texto}
          onChange={manejarCambio}
        />

        {/* Botones de acción del modal */}
        <div className="modal-buttons">
          {/* Botón para guardar cambios */}
          <button onClick={guardarPlantillaModal} className="modal-save-button">
            Actualizar
          </button>

          {/* Botón para eliminar plantilla */}
          <button
            onClick={() => {
              eliminarPlantilla(formData.id);
              setModalOpen(false);
            }}
            className="modal-delete-button"
          >
            <FaTrash style={{ marginRight: "6px" }} />
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PlantillasAdicionales;