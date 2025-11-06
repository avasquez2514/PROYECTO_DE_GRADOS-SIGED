"use client";

import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

/**
 * Componente de botón para cerrar sesión
 * 
 * Este componente proporciona un botón que permite al usuario
 * cerrar sesión eliminando los datos de autenticación del localStorage
 * y recargando la aplicación para aplicar los cambios.
 * 
 * @component
 * @example
 * ```jsx
 * <LogoutButton />
 * ```
 * 
 * @returns {JSX.Element} Botón de cierre de sesión con icono
 */
const LogoutButton = () => {
  /**
   * Función que maneja el cierre de sesión del usuario
   * 
   * Realiza las siguientes acciones:
   * 1. Elimina el token de autenticación del localStorage
   * 2. Elimina los datos del usuario del localStorage
   * 3. Recarga la página para aplicar los cambios y redirigir al login
   * 
   * @function
   * @returns {void}
   */
  const cerrarSesion = () => {
    // 🗑️ Eliminar token de autenticación JWT del almacenamiento local
    localStorage.removeItem("token");
    
    // 🗑️ Eliminar datos del usuario del almacenamiento local
    localStorage.removeItem("usuario");
    
    // 🔁 Recargar la página completa para:
    // - Aplicar los cambios de autenticación
    // - Redirigir al usuario a la página de login
    // - Reiniciar el estado de la aplicación
    window.location.reload();
  };

  return (
    // Botón que ejecuta la función de cierre de sesión al hacer click
    <button 
      onClick={cerrarSesion} 
      className="logout-button"
      // Atributos de accesibilidad
      aria-label="Cerrar sesión"
      title="Cerrar sesión actual"
    >
      {/* Ícono de salida de FontAwesome */}
      <FaSignOutAlt style={{ marginRight: "8px" }} />
      
      {/* Texto descriptivo del botón */}
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;