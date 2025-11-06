// src/components/Sidebar.tsx
"use client";

import React, { useState } from "react";
import Tema from "./Tema"; // <<< Componente Tema importado
import "../styles/sidebar.css";

import {
  FiHome,
  FiPackage,
  FiAlertTriangle,
  FiTrello,
  FiMail,
  FiFileText,
  FiUsers,
  FiEdit3,
  FiLock,
  FiChevronDown,
  FiX,
  FiSettings,
  FiZap,
  FiShield,
} from "react-icons/fi";

interface SidebarProps {
  onSelectTipoNota: (tipo: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onVistaEspecial: (vista: string) => void;
  torreSeleccionada: string | null;
  onVolverInicio: () => void;
  cerrarSesion: () => void;
  modoB2B: boolean;
}

type NavItem = {
  id: string;
  label: string;
  Icon?: any | null;
};

const Sidebar: React.FC<SidebarProps> = ({
  onSelectTipoNota,
  isOpen,
  onClose,
  onVistaEspecial,
  torreSeleccionada,
  onVolverInicio,
  cerrarSesion,
  modoB2B,
}) => {
  const [isNotasDespachoOpen, setNotasDespachoOpen] = useState<boolean>(false);
  const [hoverNotasSeguimiento, setHoverNotasSeguimiento] = useState<boolean>(false);
  const [hoverEnvioCorreos, setHoverEnvioCorreos] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>("home");

  // Definición de ítems de navegación
  const navItems: NavItem[] = [
    { id: "home", label: "Home", Icon: FiZap },
    { id: "theme-toggle", label: "Tema", Icon: null },
    { id: "about", label: "About", Icon: FiShield },
  ];

  const handleDespachoClick = () => {
    setNotasDespachoOpen(!isNotasDespachoOpen);
  };

  const handleInicioClick = () => {
    onVolverInicio();
  };

  // Función para manejar el clic en los elementos de la barra de navegación superior
  const handleNavClick = (itemId: string) => {
    // 1. Marcar el ítem como activo (para el estilo 'active')
    setActiveNav(itemId); 
    
    // 2. Ejecutar la acción específica
    if (itemId === 'home') {
      onVolverInicio(); 
    } else if (itemId === 'about') {
      cerrarSesion(); // Logout al hacer clic en "About"
    }
    // No hace nada si es "theme-toggle" (ya que Tema.tsx maneja su propio onClick)
  };


  return (
    <>
      {/* TOP NAVBAR */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo" onClick={handleInicioClick} role="button" tabIndex={0}>
            <div className="logo-icon">
              <img 
                src="/icono01.png" // Ruta desde la carpeta 'public'
                alt="Logo Principal" 
                style={{ height: '33px', width: '33px' }} // Tamaño ajustado
              />
            </div>
            <span className="logo-text"></span>
          </div>

          {/* Nav Items */}
          <div className="navbar-items">
            {navItems.map((item) => {
              // Renderiza el componente Tema en la posición de theme-toggle
              if (item.id === "theme-toggle") {
                // Tema.tsx maneja su propia lógica de clic
                return <Tema key={item.id} />;
              }

              // Renderiza Home y About (con la nueva lógica de click)
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`nav-item ${activeNav === item.id ? "active" : ""}`}
                >
                  {Icon && <Icon size={18} />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Botón Aplicaciones (Pestaña azul) */}
      <button className={`menu-button ${isOpen ? "open" : ""}`} onClick={onClose}>
        Aplicaciones
      </button>

      {/* Overlay */}
      {isOpen && <div className="overlay" onClick={onClose}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Botón cerrar (solo en móvil) */}
        <button className="close-button" onClick={onClose} aria-label="Cerrar menú">
          <FiX size={24} />
        </button>

        {/* Menú principal */}
        <ul className="menu">
          <li>
            {/* INICIO dentro del sidebar, usa la función principal handleInicioClick */}
            <button className="menu-title" onClick={handleInicioClick}>
              <FiHome size={20} />
              <span>INICIO</span>
            </button>
          </li>

          <li>
            <button className="menu-title" onClick={handleDespachoClick}>
              <FiPackage size={20} />
              <span>DESPACHO B2B</span>
              <FiChevronDown size={16} className={`chevron ${isNotasDespachoOpen ? "open" : ""}`} />
            </button>

            {/* Submenú de DESPACHO B2B (Mantenido) */}
            {isNotasDespachoOpen && (
              <ul className="submenu">
                <li className="submenu-item">
                  <button onClick={() => onVistaEspecial("alarma")}>
                    <FiAlertTriangle size={16} />
                    <span>Alarma</span>
                  </button>
                </li>
                <li className="submenu-item">
                  <button onClick={() => onVistaEspecial("aplicativos")}>
                    <FiTrello size={16} />
                    <span>Aplicativos</span>
                  </button>
                </li>
                <li
                  onMouseEnter={() => setHoverEnvioCorreos(true)}
                  onMouseLeave={() => setHoverEnvioCorreos(false)}
                  className="submenu-item"
                >
                  <button>
                    <FiMail size={16} />
                    <span>Envío de Correos</span>
                  </button>
                  {hoverEnvioCorreos && (
                    <ul className="submenu-lateral">
                      <li>
                        <button onClick={() => onVistaEspecial("envioApertura")}>Envío Apertura</button>
                      </li>
                      <li>
                        <button onClick={() => onVistaEspecial("envioCierre")}>Envío Cierre</button>
                      </li>
                      <li>
                        <button onClick={() => onVistaEspecial("envioInicio")}>Envío Inicio</button>
                      </li>
                      <li>
                        <button onClick={() => onVistaEspecial("envioPermisos")}>Envío Permisos</button>
                      </li>
                    </ul>
                  )}
                </li>
                <li
                  onMouseEnter={() => setHoverNotasSeguimiento(true)}
                  onMouseLeave={() => setHoverNotasSeguimiento(false)}
                  className="submenu-item"
                >
                  <button>
                    <FiFileText size={16} />
                    <span>Notas de campo</span>
                  </button>
                  {hoverNotasSeguimiento && (
                    <ul className="submenu-lateral">
                      <li>
                        <button onClick={() => onVistaEspecial("notasAvances")}>Notas de Avances</button>
                      </li>
                      <li>
                        <button onClick={() => onVistaEspecial("notasConciliacion")}>Notas de Conciliación</button>
                      </li>
                      <li>
                        <button onClick={() => onVistaEspecial("notasSeguimiento")}>Notas de Seguimiento</button>
                      </li>
                      <li>
                        <button onClick={() => onVistaEspecial("plantillasAdicionales")}>Plantillas</button>
                      </li>
                    </ul>
                  )}
                </li>
                <li className="submenu-item">
                  <button onClick={() => onVistaEspecial("novedadesAsesor")}>
                    <FiUsers size={16} />
                    <span>Novedades Asesor</span>
                  </button>
                </li>
                <li className="submenu-item">
                  <button onClick={() => onVistaEspecial("notasRapidas")}>
                    <FiEdit3 size={16} />
                    <span>Notas Rápidas</span>
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>

        {/* Botón logout */}
        <div className="logout-section">
          <button className="settings-button">
            <FiSettings size={20} />
            <span>Settings</span>
          </button>
          <button className="logout-button" onClick={cerrarSesion}>
            <FiLock size={20} />
            <span>Logout</span>
          </button>
        </div>

        {/* Footer nav items */}
        <div className="navbar-items sidebar-footer">
          {navItems
            .filter((item) => item.id !== "theme-toggle") // Filtra el toggle del tema
            .map((item) => {
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)} // Usa la función unificada
                  className={`nav-item ${activeNav === item.id ? "active" : ""}`}
                >
                  {Icon && <Icon size={18} />}
                  <span>{item.label}</span>
                </button>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;