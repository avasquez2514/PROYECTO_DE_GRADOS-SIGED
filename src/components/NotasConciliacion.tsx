"use client";

import React, { useState, useEffect } from "react";
import "../styles/notasConciliacion.css";
import Modal from "./Modal";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

/**
 * Props del componente NotasConciliacion
 * @interface NotasConciliacionProps
 * @property {string} torre - Identificador de la torre (actualmente no utilizado pero disponible para futuras extensiones)
 */
interface NotasConciliacionProps {
  torre: string;
}

/**
 * Tipo para los modos de operación del componente
 * @typedef {"agregar" | "modificar" | ""} Modo
 */
type Modo = "agregar" | "modificar" | "";

/**
 * Clave para almacenar el orden de categorías en localStorage
 * @constant {string}
 */
const STORAGE_KEY = "categoriasConciliacionOrden";

/**
 * Lista inicial de categorías de conciliación predefinidas
 * @constant {string[]}
 */
const categoriasIniciales = [
  "CONCILIACION EQUIPOS",
  "CONCILIACION MESA",
  "CONCILIACION METRAJE",
  "CONCILIACION HOTELES",
  "CONCILIACION N2/N3",
  "CONCILIACION INVENTARIO",
  "CONCILIACION TIGO",
  "CONCILIACION CLIENTE",
  "CONCILIACION INFRAESTRUCTURA",
  "CONCILIACION CENTROS COMERCIALES",
  "CONCILIACION BMC",
];

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
 * Icono de edición
 * @component
 * @returns {JSX.Element} Icono SVG de edición
 */
const Edit2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

/**
 * Icono de copiar
 * @component
 * @returns {JSX.Element} Icono SVG de copiar
 */
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

/**
 * Icono de eliminar
 * @component
 * @returns {JSX.Element} Icono SVG de eliminar
 */
const Trash2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

/**
 * Componente principal para gestionar categorías de conciliación
 * Permite crear, editar, eliminar, copiar y reordenar categorías mediante drag & drop
 * @component
 * @param {NotasConciliacionProps} props - Props del componente
 * @returns {JSX.Element} Interfaz completa de gestión de categorías de conciliación
 */
const NotasConciliacion: React.FC<NotasConciliacionProps> = ({ torre }) => {
  // --- ESTADOS DEL COMPONENTE ---
  
  /**
   * Estado que controla la visibilidad del modal de edición
   * @state {boolean}
   */
  const [modalOpen, setModalOpen] = useState(false);
  
  /**
   * Estado que indica el modo de operación actual
   * @state {Modo}
   */
  const [modo, setModo] = useState<Modo>("");
  
  /**
   * Estado para el texto temporal en formularios y modal
   * @state {string}
   */
  const [textoTemporal, setTextoTemporal] = useState("");
  
  /**
   * Estado que almacena el índice de la categoría en edición
   * @state {number | null}
   */
  const [indexEditar, setIndexEditar] = useState<number | null>(null);
  
  /**
   * Estado que controla la visibilidad del formulario de nueva categoría
   * @state {boolean}
   */
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  /**
   * Estado que almacena la lista de categorías de conciliación
   * Se inicializa desde localStorage o con las categorías iniciales
   * @state {string[]}
   */
  const [categorias, setCategorias] = useState<string[]>(() => {
    // Solo ejecutar en el cliente (evitar errores de SSR)
    if (typeof window !== "undefined") {
      const guardadas = localStorage.getItem(STORAGE_KEY);
      return guardadas ? JSON.parse(guardadas) : categoriasIniciales;
    }
    return categoriasIniciales;
  });

  /**
   * Efecto para persistir las categorías en localStorage cuando cambian
   * Se ejecuta cada vez que el array de categorías se modifica
   */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categorias));
  }, [categorias]);

  // --- FUNCIONES DE GESTIÓN DE CATEGORÍAS ---

  /**
   * Abre el formulario para agregar una nueva categoría
   * @function
   */
  const abrirFormularioAgregar = () => {
    setTextoTemporal("");
    setMostrarFormulario(true);
  };

  /**
   * Agrega una nueva categoría a la lista
   * @function
   */
  const agregarCategoria = () => {
    // Validar que el texto no esté vacío
    if (!textoTemporal.trim()) return;
    
    // Agregar la nueva categoría y limpiar el formulario
    setCategorias([...categorias, textoTemporal.trim()]);
    setTextoTemporal("");
    setMostrarFormulario(false);
  };

  /**
   * Abre el modal para modificar una categoría existente
   * @function
   * @param {number} index - Índice de la categoría a modificar
   */
  const abrirModalModificar = (index: number) => {
    setModo("modificar");
    setTextoTemporal(categorias[index]);
    setIndexEditar(index);
    setModalOpen(true);
  };

  /**
   * Cierra el modal y limpia los estados temporales
   * @function
   */
  const cerrarModal = () => {
    setModalOpen(false);
    setTextoTemporal("");
    setIndexEditar(null);
  };

  /**
   * Guarda los cambios del modal (modificación de categoría)
   * @function
   */
  const guardarModal = () => {
    // Validar que el texto no esté vacío
    if (!textoTemporal.trim()) return;
    
    // Actualizar la categoría en la posición específica
    if (modo === "modificar" && indexEditar !== null) {
      const nuevas = [...categorias];
      nuevas[indexEditar] = textoTemporal.trim();
      setCategorias(nuevas);
    }
    cerrarModal();
  };

  /**
   * Copia el texto de una categoría al portapapeles
   * @function
   * @param {string} texto - Texto de la categoría a copiar
   */
  const copiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto)
      .catch((err) => console.error("Error al copiar el texto:", err));
  };

  /**
   * Elimina una categoría con confirmación del usuario
   * @function
   * @param {number} index - Índice de la categoría a eliminar
   */
  const eliminarCategoria = (index: number) => {
    const confirmado = window.confirm("¿Estás seguro de eliminar esta categoría?");
    if (!confirmado) return;
    
    // Filtrar la categoría a eliminar
    const nuevas = categorias.filter((_, i) => i !== index);
    setCategorias(nuevas);
  };

  /**
   * Maneja el evento de drag & drop para reordenar categorías
   * @function
   * @param {DropResult} result - Resultado del drag & drop
   */
  const onDragEnd = (result: DropResult) => {
    // Validar que haya un destino válido
    if (!result.destination) return;
    
    // Obtener índices de origen y destino
    const items = Array.from(categorias);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Actualizar el estado con el nuevo orden
    setCategorias(items);
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="notas-conciliacion-container">
      <div className="notas-conciliacion-content">
        {/* Header del componente */}
        <div className="notas-conciliacion-header">
          <div className="notas-conciliacion-title-section">
            {/* Icono principal */}
            <div className="notas-conciliacion-icon">
              <FileTextIcon />
            </div>
            {/* Título y descripción */}
            <div className="notas-conciliacion-title-text">
              <h1>Notas de Conciliación</h1>
              <p>Gestiona las categorías de conciliación</p>
            </div>
          </div>
          
          {/* Botón para agregar nueva categoría */}
          <button className="agregar-button" onClick={abrirFormularioAgregar}>
            <PlusIcon />
            Agregar Categoría
          </button>
        </div>

        {/* Formulario inline para nueva categoría */}
        {mostrarFormulario && (
          <div className="categoria-formulario">
            <input
              type="text"
              value={textoTemporal}
              onChange={(e) => setTextoTemporal(e.target.value)}
              placeholder="Nombre de la categoría..."
            />
            <div className="categoria-formulario-botones">
              <button onClick={agregarCategoria} className="btn-guardar">
                Guardar Categoría
              </button>
              <button
                onClick={() => {
                  setMostrarFormulario(false);
                  setTextoTemporal('');
                }}
                className="btn-cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Grid de categorías con funcionalidad de drag & drop */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="categorias-list">
            {(provided) => (
              <div
                className="categorias-grid"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {categorias.map((categoria, index) => (
                  <Draggable key={categoria} draggableId={categoria} index={index}>
                    {(provided, snapshot) => (
                      <div
                        className={`categoria-item ${snapshot.isDragging ? 'dragging' : ''}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {/* Header de la categoría con nombre */}
                        <div className="categoria-header">
                          <h3 className="categoria-nombre">{categoria}</h3>
                        </div>
                        
                        {/* Botones de acción para cada categoría */}
                        <div className="categoria-botones">
                          {/* Botón editar */}
                          <button
                            onClick={() => abrirModalModificar(index)}
                            className="edit"
                            title="Editar"
                          >
                            <Edit2Icon />
                          </button>
                          
                          {/* Botón copiar */}
                          <button
                            onClick={() => copiarTexto(categoria)}
                            className="copy"
                            title="Copiar"
                          >
                            <CopyIcon />
                          </button>
                          
                          {/* Botón eliminar */}
                          <button
                            onClick={() => eliminarCategoria(index)}
                            className="delete"
                            title="Eliminar"
                          >
                            <Trash2Icon />
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

        {/* Estado vacío cuando no hay categorías */}
        {categorias.length === 0 && (
          <div className="empty-state">
            <FileTextIcon />
            <p>No hay categorías disponibles</p>
            <p>Haz clic en "Agregar Categoría" para crear una nueva</p>
          </div>
        )}

        {/* Footer con contador de categorías */}
        <div className="categorias-footer">
          <p>
            Total de categorías: <span>{categorias.length}</span>
          </p>
        </div>
      </div>

      {/* Modal para editar categorías */}
      <Modal isOpen={modalOpen} onClose={cerrarModal}>
        <h2>Modificar Categoría</h2>
        <input
          type="text"
          value={textoTemporal}
          onChange={(e) => setTextoTemporal(e.target.value)}
          placeholder="Escribe la categoría"
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button onClick={guardarModal} className="modal-save-button">
          Actualizar
        </button>
      </Modal>
    </div>
  );
};

export default NotasConciliacion;