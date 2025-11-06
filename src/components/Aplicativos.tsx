"use client";

/**
 * Componente: Aplicativos
 * ------------------------------------------
 * 
 * Este componente gestiona la visualización, creación, edición
 * y eliminación de aplicativos clasificados por categoría.
 * Cada usuario autenticado puede tener su propio conjunto
 * de aplicativos, los cuales se almacenan y protegen mediante
 * autenticación JWT en el backend.
 * 
 * ------------------------------------------
 * FUNCIONALIDADES PRINCIPALES:
 * 
 * - Listar aplicativos agrupados por categoría.
 * - Filtrar aplicativos por nombre en tiempo real.
 * - Agregar nuevos aplicativos asociados al usuario actual.
 * - Editar o eliminar aplicativos existentes.
 * - Crear y eliminar categorías personalizadas.
 * - Sincronizar datos con el backend mediante peticiones HTTP (fetch)
 *   autenticadas con token JWT.
 */

import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import "../styles/aplicativos.css";
import Modal from "./Modal";

// --- INTERFACES ---

/**
 * Interfaz que define la estructura de un aplicativo
 * @interface Aplicativo
 * @property {number} id - Identificador único del aplicativo
 * @property {string} nombre - Nombre descriptivo del aplicativo
 * @property {string} url - URL de acceso al aplicativo
 * @property {string} categoria - Categoría a la que pertenece el aplicativo
 */
interface Aplicativo {
  id: number;
  nombre: string;
  url: string;
  categoria: string;
}

/**
 * Interfaz para la creación de nuevos aplicativos
 * @interface NuevoAplicativo
 * @property {string} nombre - Nombre del nuevo aplicativo
 * @property {string} url - URL del nuevo aplicativo
 * @property {string} categoria - Categoría del nuevo aplicativo
 */
interface NuevoAplicativo {
  nombre: string;
  url: string;
  categoria: string;
}

// --- CONSTANTES ---

/**
 * URL base de la API para operaciones CRUD de aplicativos
 * @constant {string}
 */
const API = `http://localhost:4000/api/aplicativos`;

/**
 * Componente principal de gestión de aplicativos
 * @component
 * @returns {JSX.Element} Interfaz completa de gestión de aplicativos
 */
const Aplicativos: React.FC = () => {
  // --- ESTADO ---
  
  /**
   * Estado que almacena la lista completa de aplicativos del usuario
   * @state {Aplicativo[]}
   */
  const [aplicativos, setAplicativos] = useState<Aplicativo[]>([]);
  
  /**
   * Estado para el formulario de nuevo aplicativo o edición
   * @state {NuevoAplicativo}
   */
  const [nuevo, setNuevo] = useState<NuevoAplicativo>({
    nombre: "",
    url: "",
    categoria: "",
  });
  
  /**
   * Estado que almacena las categorías disponibles del usuario
   * @state {string[]}
   */
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<string[]>([]);
  
  /**
   * Estado para el nombre de nueva categoría en el modal
   * @state {string}
   */
  const [otraCategoria, setOtraCategoria] = useState("");
  
  /**
   * Estado que controla la categoría actualmente seleccionada en la sidebar
   * @state {string}
   */
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  /**
   * Estado que controla la visibilidad del modal
   * @state {boolean}
   */
  const [modalOpen, setModalOpen] = useState(false);
  
  /**
   * Estado que indica si se está editando un aplicativo existente
   * @state {boolean}
   */
  const [editando, setEditando] = useState(false);
  
  /**
   * Estado que almacena el ID del aplicativo en edición
   * @state {number | null}
   */
  const [editandoId, setEditandoId] = useState<number | null>(null);
  
  /**
   * Estado que controla el tipo de modal activo (aplicativo o categoría)
   * @state {"aplicativo" | "categoria"}
   */
  const [modoModal, setModoModal] = useState<"aplicativo" | "categoria">("aplicativo");

  /**
   * Estado para el filtro de búsqueda por nombre de aplicativo
   * @state {string}
   */
  const [filtroNombre, setFiltroNombre] = useState("");

  // --- LÓGICA PRINCIPAL ---

  /**
   * Obtiene los datos del usuario desde localStorage
   * @returns {object | null} Datos del usuario o null si no está autenticado
   */
  const getUsuario = () => {
    // Verificar que window está disponible (evita errores en SSR)
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : null;
  };

  /**
   * Obtiene el token JWT desde localStorage
   * @returns {string | null} Token de autenticación o null
   */
  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /**
   * Efecto que carga los aplicativos al montar el componente
   * Se ejecuta una vez al inicializar el componente
   */
  useEffect(() => {
    fetchAplicativos();
  }, []);

  /**
   * Función asíncrona que obtiene los aplicativos del usuario desde la API
   * @async
   * @returns {Promise<void>}
   */
  const fetchAplicativos = async () => {
    const token = getToken();
    const usuario = getUsuario();
    
    // Validar que existe autenticación
    if (!token || !usuario?.id) return;

    try {
      // Realizar petición GET a la API con autenticación
      const res = await fetch(`${API}?usuario_id=${usuario.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: Aplicativo[] = await res.json();
      setAplicativos(data);

      // Extraer categorías únicas de los aplicativos
      const categorias = [...new Set(data.map((a) => a.categoria))];
      setCategoriasDisponibles(categorias);
      
      // Seleccionar primera categoría por defecto si no hay selección
      if (!categoriaSeleccionada && categorias.length > 0) {
        setCategoriaSeleccionada(categorias[0]);
      }
    } catch (err) {
      console.error("Error al cargar aplicativos:", err);
    }
  };

  /**
   * Agrega un nuevo aplicativo a través de la API
   * @async
   * @returns {Promise<void>}
   */
  const agregarAplicativo = async () => {
    const token = getToken();
    const usuario = getUsuario();
    
    // Validaciones de autenticación y datos requeridos
    if (!token || !usuario?.id) return;
    if (!nuevo.nombre || !nuevo.url || !nuevo.categoria)
      return alert("Completa todos los campos");

    try {
      // Petición POST para crear nuevo aplicativo
      await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...nuevo, usuario_id: usuario.id }),
      });

      resetFormulario();
      fetchAplicativos(); // Recargar lista
    } catch (err) {
      console.error("Error al agregar:", err);
    }
  };

  /**
   * Guarda los cambios de un aplicativo editado
   * @async
   * @returns {Promise<void>}
   */
  const guardarEdicion = async () => {
    const token = getToken();
    const usuario = getUsuario();
    
    // Validar que hay un aplicativo en edición
    if (!token || !usuario?.id || !editandoId) return;

    try {
      // Petición PUT para actualizar aplicativo existente
      await fetch(`${API}/${editandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...nuevo, usuario_id: usuario.id }),
      });

      resetFormulario();
      fetchAplicativos(); // Recargar lista
    } catch (err) {
      console.error("Error al editar:", err);
    }
  };

  /**
   * Elimina un aplicativo específico con confirmación
   * @async
   * @param {number} id - ID del aplicativo a eliminar
   * @returns {Promise<void>}
   */
  const eliminarAplicativo = async (id: number) => {
    const token = getToken();
    if (!token) return;
    
    // Confirmación de eliminación
    if (!window.confirm("¿Eliminar este aplicativo?")) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Manejar errores HTTP
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.mensaje || `Error ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("✅ Aplicativo eliminado:", result.mensaje);
      fetchAplicativos(); // Recargar lista
    } catch (err) {
      console.error("❌ Error al eliminar aplicativo:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      alert(`Error al eliminar aplicativo: ${errorMessage}`);
    }
  };

  /**
   * Elimina una categoría y todos sus aplicativos
   * @param {string} cat - Nombre de la categoría a eliminar
   */
  const eliminarCategoria = (cat: string) => {
    // Confirmación de eliminación
    if (!window.confirm(`¿Eliminar la categoría "${cat}" y todos sus aplicativos?`))
      return;
    
    // Filtrar aplicativos y categorías
    setAplicativos(aplicativos.filter((a) => a.categoria !== cat));
    const nuevas = categoriasDisponibles.filter((c) => c !== cat);
    setCategoriasDisponibles(nuevas);
    
    // Ajustar categoría seleccionada si era la eliminada
    if (categoriaSeleccionada === cat) {
      setCategoriaSeleccionada(nuevas[0] || "");
    }
  };

  // --- MANEJADORES DE MODAL ---

  /**
   * Abre el modal en modo edición con los datos de un aplicativo
   * @param {Aplicativo} a - Aplicativo a editar
   */
  const abrirEditar = (a: Aplicativo) => {
    setNuevo({ nombre: a.nombre, url: a.url, categoria: a.categoria });
    setEditando(true);
    setEditandoId(a.id);
    setModoModal("aplicativo");
    setModalOpen(true);
  };

  /**
   * Abre el modal para agregar un nuevo aplicativo
   */
  const abrirModalAplicativo = () => {
    setNuevo({ 
      nombre: "", 
      url: "", 
      categoria: categoriaSeleccionada || "" 
    });
    setEditando(false);
    setEditandoId(null);
    setModoModal("aplicativo");
    setModalOpen(true);
  };

  /**
   * Abre el modal para crear una nueva categoría
   */
  const abrirModalCategoria = () => {
    setOtraCategoria("");
    setModoModal("categoria");
    setModalOpen(true);
  };

  /**
   * Resetea el formulario y cierra el modal
   */
  const resetFormulario = () => {
    setNuevo({ nombre: "", url: "", categoria: "" });
    setEditando(false);
    setEditandoId(null);
    setModalOpen(false);
  };

  /**
   * Función principal de guardado que maneja ambos modos del modal
   */
  const handleGuardar = () => {
    if (modoModal === "aplicativo") {
      // Modo aplicativo: crear o editar
      if (editando) {
        guardarEdicion();
      } else {
        agregarAplicativo();
      }
    } else {
      // Modo categoría: crear nueva categoría
      if (!otraCategoria) return alert("Ingresa un nombre");
      if (!categoriasDisponibles.includes(otraCategoria)) {
        setCategoriasDisponibles((prev) => [...prev, otraCategoria]);
      }
      setCategoriaSeleccionada(otraCategoria);
      setModalOpen(false);
    }
  };

  // --- CÁLCULOS ---

  /**
   * Agrupa los aplicativos por categoría para la sidebar
   * @type {Record<string, Aplicativo[]>}
   */
  const agrupados = (aplicativos || []).reduce(
    (acc: Record<string, Aplicativo[]>, a) => {
      const cat = a.categoria || "Sin categoría";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(a);
      return acc;
    },
    {} as Record<string, Aplicativo[]>
  );

  /**
   * Aplicativos filtrados por categoría seleccionada y término de búsqueda
   * @type {Aplicativo[]}
   */
  const aplicativosFiltrados = (
    agrupados[categoriaSeleccionada] || []
  ).filter((a) =>
    a.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  // --- RENDER ---
  return (
    <div className="app-layout">
      {/* --- BARRA LATERAL --- */}
      <aside className="app-sidebar">
        <h3 className="sidebar-title">CATEGORIAS</h3>
        <nav className="sidebar-nav">
          {categoriasDisponibles.map((cat) => (
            <button
              key={cat}
              className={`sidebar-btn ${
                cat === categoriaSeleccionada ? "active" : ""
              }`}
              onClick={() => setCategoriaSeleccionada(cat)}
            >
              <span>{cat}</span>
              <span className="sidebar-btn-count">
                {agrupados[cat]?.length || 0}
              </span>
            </button>
          ))}
        </nav>
        <div className="sidebar-buttons">
          <button className="btn-add-category" onClick={abrirModalCategoria}>
            <FaPlus style={{ marginRight: "0.5rem" }} />
            Agregar Categoría
          </button>
          <button className="btn-add-app-sidebar" onClick={abrirModalAplicativo}>
            <FaPlus style={{ marginRight: "0.5rem" }} />
            Agregar Aplicativo
          </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="app-main-content">
        <header className="content-header">
          <h1 className="content-title">{categoriaSeleccionada}</h1>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar aplicativo..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>
        </header>

        {/* --- CONTENEDOR DE LA TABLA --- */}
        <div className="table-container">
          <h3 className="table-title">Lista de aplicativos</h3>
          <table className="app-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Icono</th>
                <th>Nombre</th>
                <th>URL</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {aplicativosFiltrados.map((a) => (
                <tr key={a.id}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    {/* Icono del aplicativo desde favicon */}
                    <img
                      src={`${new URL(a.url).origin}/favicon.ico`}
                      alt={`Logo de ${a.nombre}`}
                      className="app-logo"
                      onError={(e) => {
                        // Fallback a icono por defecto si favicon no existe
                        (e.target as HTMLImageElement).src = "/icono-app.png";
                      }}
                    />
                  </td>
                  <td>{a.nombre}</td>
                  <td className="url-cell">
                    <a href={a.url} target="_blank" rel="noreferrer" title={a.url}>
                      {a.url}
                    </a>
                  </td>
                  <td>
                    <div className="actions-cell">
                      {/* Botón editar */}
                      <button
                        className="btn-icon edit"
                        title="Editar"
                        onClick={() => abrirEditar(a)}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      {/* Botón eliminar */}
                      <button
                        className="btn-icon delete"
                        title="Eliminar"
                        onClick={() => eliminarAplicativo(a.id)}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Mensaje cuando no hay resultados */}
          {aplicativosFiltrados.length === 0 && (
            <p className="empty-table-message">
              No se encontraron aplicativos
              {filtroNombre && ` que coincidan con "${filtroNombre}"`}.
            </p>
          )}
        </div>
      </main>

      {/* --- MODAL APLICATIVO --- */}
      <Modal 
        isOpen={modalOpen && modoModal === "aplicativo"} 
        onClose={resetFormulario}
        onSave={handleGuardar}
        title={editando ? "Editar Aplicativo" : "Agregar Aplicativo"}
        showSaveButton={true}
      >
        <div className="form-section">
          <label className="section-label" htmlFor="app-name">
            Nombre del aplicativo
          </label>
          <input
            id="app-name"
            type="text"
            className="form-input"
            placeholder="Ej: Google Drive"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          />
        </div>

        <div className="form-section">
          <label className="section-label" htmlFor="app-url">
            URL
          </label>
          <input
            id="app-url"
            type="text"
            className="form-input"
            placeholder="https://drive.google.com"
            value={nuevo.url}
            onChange={(e) => setNuevo({ ...nuevo, url: e.target.value })}
          />
        </div>

        <div className="form-section">
          <label className="section-label" htmlFor="app-category">
            Categoría
          </label>
          <select
            id="app-category"
            className="form-select"
            value={nuevo.categoria}
            onChange={(e) =>
              setNuevo({ ...nuevo, categoria: e.target.value })
            }
          >
            <option value="">Selecciona una categoría</option>
            {categoriasDisponibles.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </Modal>

      {/* --- MODAL CATEGORÍA --- */}
      <Modal 
        isOpen={modalOpen && modoModal === "categoria"} 
        onClose={resetFormulario}
        onSave={handleGuardar}
        title="Nueva Categoría"
        showSaveButton={true}
      >
        <div className="form-section">
          <label className="section-label" htmlFor="cat-name">
            Nombre de la categoría
          </label>
          <input
            id="cat-name"
            type="text"
            className="form-input"
            value={otraCategoria}
            onChange={(e) => setOtraCategoria(e.target.value)}
            placeholder="Ej: Utilidades"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Aplicativos;