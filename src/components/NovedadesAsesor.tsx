"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import "../styles/novedadesAsesor.css";

/**
 * Interfaz que define la estructura de una novedad del asesor
 * @interface Novedad
 * @property {number} id - Identificador único de la novedad (timestamp)
 * @property {string} texto - Contenido textual de la novedad
 * @property {string | null} imagen - URL de datos de la imagen adjunta o null si no hay imagen
 * @property {string} fechaHora - Fecha y hora de creación en formato local
 */
interface Novedad {
  id: number;
  texto: string;
  imagen: string | null;
  fechaHora: string;
}

/**
 * Componente para gestionar novedades del asesor con funcionalidad de imágenes
 * Permite crear, visualizar y eliminar novedades con persistencia en localStorage
 * @component
 * @returns {JSX.Element} Interfaz completa de gestión de novedades
 */
const NovedadesAsesor: React.FC = () => {
  // --- ESTADOS DEL COMPONENTE ---
  
  /**
   * Estado para el texto de la nueva novedad
   * @state {string}
   */
  const [texto, setTexto] = useState<string>("");
  
  /**
   * Estado para la imagen adjunta en formato data URL
   * @state {string | null}
   */
  const [imagen, setImagen] = useState<string | null>(null);
  
  /**
   * Estado que almacena la lista completa de novedades
   * @state {Novedad[]}
   */
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  
  /**
   * Estado que controla la visibilidad del modal de creación
   * @state {boolean}
   */
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  
  /**
   * Estado que indica si los datos ya fueron cargados desde localStorage
   * @state {boolean}
   */
  const [cargado, setCargado] = useState<boolean>(false);

  // --- EFECTOS DE PERSISTENCIA ---

  /**
   * Efecto para cargar novedades desde localStorage al montar el componente
   * Solo se ejecuta en el cliente (evita errores de SSR)
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const guardadas = localStorage.getItem("novedadesAsesor");
      if (guardadas) {
        try {
          // Parsear y establecer novedades guardadas
          setNovedades(JSON.parse(guardadas));
        } catch (error) {
          console.error("Error al parsear las novedades:", error);
        }
      }
      setCargado(true);
    }
  }, []);

  /**
   * Efecto para guardar novedades en localStorage cuando cambian
   * Solo se ejecuta después de que los datos han sido cargados inicialmente
   */
  useEffect(() => {
    if (cargado && typeof window !== "undefined") {
      localStorage.setItem("novedadesAsesor", JSON.stringify(novedades));
    }
  }, [novedades, cargado]);

  // --- MANEJADORES DE EVENTOS ---

  /**
   * Maneja la selección de archivos de imagen y los convierte a data URL
   * @function
   * @param {ChangeEvent<HTMLInputElement>} e - Evento de cambio del input file
   */
  const handleImagenChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Crear FileReader para convertir imagen a data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagen(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Agrega una nueva novedad a la lista
   * @function
   */
  const agregarNovedad = () => {
    // Validar que haya texto antes de guardar
    if (texto.trim() === "") {
      alert("Por favor escribe algo antes de guardar");
      return;
    }

    // Obtener fecha y hora actual formateada
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString("es-CO"); // Formato colombiano
    const hora = ahora.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Formato 12 horas con AM/PM
    });

    // Crear objeto de nueva novedad
    const nuevaNovedad: Novedad = {
      id: Date.now(), // Usar timestamp como ID único
      texto,
      imagen,
      fechaHora: `${fecha} ${hora}`,
    };

    // Agregar nueva novedad al inicio del array y limpiar formulario
    setNovedades([nuevaNovedad, ...novedades]);
    setTexto("");
    setImagen(null);
    setModalAbierto(false);
  };

  /**
   * Elimina una novedad con confirmación del usuario
   * @function
   * @param {number} id - ID de la novedad a eliminar
   */
  const eliminarNovedad = (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta novedad?")) {
      setNovedades(novedades.filter((n) => n.id !== id));
    }
  };

  /**
   * Cierra el modal y limpia los campos del formulario
   * @function
   */
  const cerrarModal = () => {
    setModalAbierto(false);
    setTexto("");
    setImagen(null);
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="novedades-container">
      {/* Header del componente */}
      <div className="novedades-header">
        <div className="novedades-header-left">
          {/* Icono del header */}
          <span className="novedades-header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </span>
          {/* Título y descripción */}
          <div>
            <h2 className="novedades-titulo">Novedades del Asesor</h2>
            <p className="novedades-descripcion">Crea y administra novedades importantes</p>
          </div>
        </div>
        {/* Botón para abrir modal de nueva novedad */}
        <button className="btn-agregar-header" onClick={() => setModalAbierto(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Agregar Novedad
        </button>
      </div>

      {/* Contenido principal */}
      <div className="novedades-content">
        <div className="novedades-content-inner">
          {/* Sección de historial de novedades */}
          <div className="novedades-historial">
            <div className="novedades-historial-header">
              {/* Icono del historial */}
              <div className="novedades-historial-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <h3 className="novedades-historial-titulo">Historial de Novedades</h3>
            </div>

            {/* Estado vacío cuando no hay novedades */}
            {novedades.length === 0 ? (
              <div className="novedades-vacio">
                <svg className="novedades-vacio-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <p className="novedades-vacio-texto">No hay novedades aún</p>
                <p className="novedades-vacio-subtexto">
                  Crea tu primera novedad usando el botón de arriba
                </p>
              </div>
            ) : (
              /* Lista de novedades existentes */
              <ul className="novedades-lista">
                {novedades.map((n) => (
                  <li key={n.id} className="novedades-item">
                    {/* Header de cada novedad con fecha y botón eliminar */}
                    <div className="novedades-item-header">
                      <div className="novedades-item-fecha">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {n.fechaHora}
                      </div>
                      {/* Botón para eliminar novedad individual */}
                      <button
                        className="btn-eliminar-item"
                        onClick={() => eliminarNovedad(n.id)}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Eliminar
                      </button>
                    </div>
                    {/* Texto de la novedad */}
                    <p className="novedades-item-texto">{n.texto}</p>
                    {/* Imagen adjunta (si existe) */}
                    {n.imagen && (
                      <div className="novedades-item-imagen">
                        <img src={n.imagen} alt="novedad" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear nueva novedad */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="modal-header">
              <h3 className="modal-titulo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Nueva Novedad
              </h3>
              {/* Botón para cerrar modal */}
              <button className="modal-close-btn" onClick={cerrarModal}>
                ×
              </button>
            </div>

            {/* Cuerpo del modal con formulario */}
            <div className="modal-body">
              {/* Textarea para el contenido de la novedad */}
              <textarea
                className="novedades-textarea"
                rows={5}
                placeholder="Escribe la novedad..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />

              {/* Input para adjuntar imagen */}
              <div className="novedades-imagen-label">
                <span className="novedades-imagen-label-text">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Adjuntar imagen (opcional)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagenChange}
                  className="novedades-imagen-input"
                />
              </div>

              {/* Preview de la imagen seleccionada */}
              {imagen && (
                <div className="novedades-preview">
                  <img src={imagen} alt="preview" />
                </div>
              )}
            </div>

            {/* Footer del modal con botones de acción */}
            <div className="modal-footer">
              {/* Botón cancelar */}
              <button className="btn-modal btn-cancelar" onClick={cerrarModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Cancelar
              </button>
              {/* Botón guardar */}
              <button className="btn-modal btn-guardar" onClick={agregarNovedad}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Guardar Novedad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovedadesAsesor;