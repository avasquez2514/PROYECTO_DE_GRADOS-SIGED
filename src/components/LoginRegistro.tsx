"use client";

import React, { useState, FormEvent } from "react";
import { FaEye, FaEyeSlash, FaGoogle, FaApple } from "react-icons/fa";
import "../styles/loginregistro.css";

/**
 * Props del componente LoginRegistro
 * @interface LoginRegistroProps
 * @property {(usuario: any) => void} onLogin - Función callback que se ejecuta al realizar login exitoso
 */
interface LoginRegistroProps {
  onLogin: (usuario: any) => void;
}

/**
 * Componente de autenticación para login y registro de usuarios
 * Maneja login, registro y recuperación de contraseña
 * @component
 * @param {LoginRegistroProps} props - Props del componente
 * @returns {JSX.Element} Interfaz de autenticación completa
 */
const LoginRegistro: React.FC<LoginRegistroProps> = ({ onLogin }) => {
  // --- ESTADOS DEL COMPONENTE ---
  
  /**
   * Estado que controla si se muestra el formulario de registro o login
   * @state {boolean}
   */
  const [esRegistro, setEsRegistro] = useState(false);
  
  /**
   * Estado para el email del usuario
   * @state {string}
   */
  const [email, setEmail] = useState("");
  
  /**
   * Estado para el nombre del usuario (solo en registro)
   * @state {string}
   */
  const [nombre, setNombre] = useState("");
  
  /**
   * Estado para la contraseña del usuario
   * @state {string}
   */
  const [contraseña, setContraseña] = useState("");
  
  /**
   * Estado que indica si se está procesando una petición
   * @state {boolean}
   */
  const [cargando, setCargando] = useState(false);
  
  /**
   * Estado para mostrar/ocultar la contraseña en login/registro
   * @state {boolean}
   */
  const [mostrar, setMostrar] = useState(false);
  
  /**
   * Estado para mostrar/ocultar la contraseña actual en recuperación
   * @state {boolean}
   */
  const [mostrarActual, setMostrarActual] = useState(false);
  
  /**
   * Estado para mostrar/ocultar la nueva contraseña en recuperación
   * @state {boolean}
   */
  const [mostrarNueva, setMostrarNueva] = useState(false);
  
  /**
   * Estado para mostrar/ocultar la confirmación de contraseña en recuperación
   * @state {boolean}
   */
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  
  /**
   * Estado que controla si se muestra el formulario de recuperación de contraseña
   * @state {boolean}
   */
  const [modoRecuperar, setModoRecuperar] = useState(false);
  
  /**
   * Estado para la contraseña actual en recuperación
   * @state {string}
   */
  const [actual, setActual] = useState("");
  
  /**
   * Estado para la nueva contraseña en recuperación
   * @state {string}
   */
  const [nueva, setNueva] = useState("");
  
  /**
   * Estado para la confirmación de nueva contraseña en recuperación
   * @state {string}
   */
  const [confirmar, setConfirmar] = useState("");

  // --- FUNCIONES DE UTILIDAD ---

  /**
   * Guarda la sesión del usuario en localStorage
   * @param {string} token - Token JWT de autenticación
   * @param {any} usuario - Datos del usuario autenticado
   */
  const guardarSesionEnLocalStorage = (token: string, usuario: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
  };

  /**
   * Maneja el envío del formulario de login o registro
   * @async
   * @param {FormEvent} e - Evento del formulario
   * @returns {Promise<void>}
   */
  const manejarEnvio = async (e: FormEvent) => {
    e.preventDefault();
    
    // Determinar ruta y datos según el modo (login o registro)
    const ruta = esRegistro ? "registro" : "login";
    const datos = esRegistro ? { email, nombre, contraseña } : { email, contraseña };

    try {
      setCargando(true);
      
      // Obtener URL base de la API desde variables de entorno o usar localhost por defecto
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      
      // Realizar petición a la API
      const respuesta = await fetch(`${API_BASE}/api/auth/${ruta}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      // Manejar errores de la API
      if (!respuesta.ok) {
        alert(resultado.mensaje || "Error en la autenticación");
        return;
      }

      // Guardar sesión y notificar éxito
      guardarSesionEnLocalStorage(resultado.token, resultado.usuario);
      alert(resultado.mensaje);
      onLogin(resultado.usuario);
    } catch (error) {
      alert("Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  /**
   * Maneja la recuperación/cambio de contraseña
   * @async
   * @param {FormEvent} e - Evento del formulario
   * @returns {Promise<void>}
   */
  const recuperarContraseña = async (e: FormEvent) => {
    e.preventDefault();

    // Validar que las contraseñas coincidan
    if (nueva !== confirmar) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      // Obtener URL base de la API
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      
      // Realizar petición para cambiar contraseña
      const respuesta = await fetch(`${API_BASE}/api/auth/recuperar-contrasena`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, actual, nueva }),
      });

      const resultado = await respuesta.json();

      // Manejar errores de la API
      if (!respuesta.ok) {
        alert(resultado.mensaje || "Error al recuperar contraseña");
        return;
      }

      // Notificar éxito y limpiar formulario
      alert(resultado.mensaje);
      setModoRecuperar(false);
      setEmail("");
      setActual("");
      setNueva("");
      setConfirmar("");
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="login-wrapper">
      <div className="login-card-wrapper">
        {/* Logo de la aplicación */}
        <img 
          src="/icono01.png" 
          alt="Logo" 
          className="login-logo" 
          style={{width: "60px", height: "60px", marginBottom: "1.5rem"}} 
        />
        
        {/* Pestañas de navegación entre login y registro */}
        <div className="login-tabs">
          <button
            className={`login-tab ${esRegistro ? "active" : ""}`}
            onClick={() => setEsRegistro(true)}
            disabled={modoRecuperar}
          >
            Inscribirse
          </button>
          <button
            className={`login-tab ${!esRegistro && !modoRecuperar ? "active" : ""}`}
            onClick={() => setEsRegistro(false)}
            disabled={modoRecuperar}
          >
            Inciar sesión
          </button>
        </div>

        {/* Contenedor principal del formulario */}
        <div className="login-card">
          {modoRecuperar ? (
            /* --- MODO RECUPERACIÓN DE CONTRASEÑA --- */
            <>
              <h2 className="login-title">Recuperar contraseña</h2>
              <form onSubmit={recuperarContraseña} className="login-form">
                {/* Campo de email */}
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="login-input"
                  />
                </div>

                {/* Campo de contraseña actual con toggle de visibilidad */}
                <div className="form-group password-group">
                  <input
                    type={mostrarActual ? "text" : "password"}
                    placeholder="Contraseña actual"
                    value={actual}
                    onChange={(e) => setActual(e.target.value)}
                    required
                    className="login-input"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setMostrarActual((v) => !v)}
                  >
                    {mostrarActual ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Campo de nueva contraseña con toggle de visibilidad */}
                <div className="form-group password-group">
                  <input
                    type={mostrarNueva ? "text" : "password"}
                    placeholder="Nueva contraseña"
                    value={nueva}
                    onChange={(e) => setNueva(e.target.value)}
                    required
                    className="login-input"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setMostrarNueva((v) => !v)}
                  >
                    {mostrarNueva ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Campo de confirmación de contraseña con toggle de visibilidad */}
                <div className="form-group password-group">
                  <input
                    type={mostrarConfirmar ? "text" : "password"}
                    placeholder="Confirmar nueva contraseña"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    required
                    className="login-input"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setMostrarConfirmar((v) => !v)}
                  >
                    {mostrarConfirmar ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Botones de acción */}
                <button type="submit" className="login-btn-primary">
                  Guardar nueva contraseña
                </button>
                <button
                  type="button"
                  onClick={() => setModoRecuperar(false)}
                  className="login-btn-secondary"
                >
                  Cancelar
                </button>
              </form>
            </>
          ) : (
            /* --- MODO LOGIN / REGISTRO --- */
            <>
              <h2 className="login-title">
                {esRegistro ? "Crear una cuenta" : "Ingresa tu contraseña"}
              </h2>

              <form onSubmit={manejarEnvio} className="login-form">
                {/* Campos de nombre y apellido (solo en registro) */}
                {esRegistro && (
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        className="login-input"
                        autoComplete="name"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Apellido"
                        className="login-input"
                      />
                    </div>
                  </div>
                )}

                {/* Campo de email con icono */}
                <div className="form-group">
                  <div className="input-icon-wrapper">
                    <svg
                      className="input-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      placeholder="Ingresa tu correo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="login-input"
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Campo de contraseña con toggle de visibilidad */}
                <div className="form-group password-group">
                  <input
                    type={mostrar ? "text" : "password"}
                    placeholder="Contraseña"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    required
                    className="login-input"
                    autoComplete={esRegistro ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setMostrar((v) => !v)}
                  >
                    {mostrar ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Botón de envío principal */}
                <button type="submit" className="login-btn-primary" disabled={cargando}>
                  {cargando
                    ? esRegistro
                      ? "Registrando..."
                      : "Ingresando..."
                    : esRegistro
                    ? "Crear cuenta"
                    : "Ingresar"}
                </button>
              </form>

              {/* Separador para login social */}
              <div className="login-divider">
                <span>O INICIA SESIÓN CON</span>
              </div>

              {/* Botones de login social */}
              <div className="social-buttons">
                <button className="social-btn google">
                  <FaGoogle size={18} />
                </button>
                <button className="social-btn apple">
                  <FaApple size={18} />
                </button>
              </div>

              {/* Texto de términos y condiciones */}
              <p className="login-footer-text">
                Al crear una cuenta, aceptas nuestros Términos y Condiciones.
              </p>
            </>
          )}
        </div>

        {/* Enlace para recuperar contraseña (solo visible en modo login/registro) */}
        {!modoRecuperar && (
          <button
            type="button"
            className="forgot-password-btn"
            onClick={() => setModoRecuperar(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginRegistro;