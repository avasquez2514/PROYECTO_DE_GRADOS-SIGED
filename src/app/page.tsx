"use client";

import React, { useEffect, useState } from "react";
import Alarma from "../components/Alarma";
import Aplicativos from "../components/Aplicativos";
import EnvioCorreos from "../components/EnvioCorreos";
import LoginRegistro from "../components/LoginRegistro";
import NotasAvances from "../components/NotasAvances";
import NotasConciliacion from "../components/NotasConciliacion";
import NotasRapidas from "../components/NotasRapidas";
import NovedadesAsesor from "../components/NovedadesAsesor";
import PlantillasAdicionales from "../components/PlantillasAdicionales";
import PlantillaSelector from "../components/PlantillaSelector";
import Sidebar from "../components/Sidebar";
import TorreSelector from "../components/TorreSelector";
import Tema from "../components/Tema";

import { useNavegacion } from "../hooks/useNavegacion";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

export default function Page() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [mostrarSelector, setMostrarSelector] = useState<boolean>(false);
  const [despachoOpen, setDespachoOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem("usuario");
      if (guardado && guardado !== "undefined") {
        setUsuario(JSON.parse(guardado));
      }
    } catch (error) {
      console.error("❌ Error al leer usuario desde localStorage:", error);
    }
  }, []);

  const {
    tipoNota,
    torre,
    pantallaBlanca,
    modoB2B,
    vista,
    vistaEspecial,
    handleSelectTipoNota,
    handleTorreSeleccionada,
    handleVistaEspecial,
    handleVolverInicio,
  } = useNavegacion();

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  const handleMenuOpen = () => setMenuOpen(!menuOpen);

  // Cierra el sidebar cuando hace click en INICIO
  const handleInicioClick = () => {
    handleVolverInicio();
    setMenuOpen(false);
    setDespachoOpen(false);
  };

  // Abre el sidebar y muestra pantalla en blanco
  const handleAbrirMenuConTorre = () => {
    setMenuOpen(true);
    // 🚀 La función que elimina el Sidebar ahora se llama desde el botón "Let's talk"
    handleSelectTipoNota("DESPACHO B2B"); 
  };

  // Maneja la selección de torre
  const handleTorreSeleccionadaConSubmenu = (torreSeleccionada: string) => {
    handleTorreSeleccionada(torreSeleccionada);
    setMostrarSelector(false);
  };

  // Determina si mostrar la pantalla de bienvenida elegante
  const mostrarBienvenida = usuario && vista === "inicio" && !pantallaBlanca;

  return (
    <div className="app-container">
      <div className="marca-de-agua"></div>

      {!usuario ? (
        <LoginRegistro onLogin={setUsuario} />
      ) : (
        <>
       

          {torre && (
            <div className="torre-fija">
              TU TORRE ES: <span className="torre-etiqueta">{torre}</span>
            </div>
          )}

          <Sidebar
            onSelectTipoNota={handleSelectTipoNota}
            isOpen={menuOpen}
            onClose={handleMenuOpen}
            onVistaEspecial={handleVistaEspecial}
            torreSeleccionada={torre}
            modoB2B={modoB2B}
            onVolverInicio={handleInicioClick}
            cerrarSesion={cerrarSesion}
            // Estas props no están definidas en el Sidebar original que me pasaste,
            // pero las mantengo por si las tienes en otro archivo:
            // despachoOpen={despachoOpen}
            // setDespachoOpen={setDespachoOpen}
          />

          <div className="main-container">
            {mostrarSelector ? (
              <TorreSelector onSelect={handleTorreSeleccionadaConSubmenu} />
            ) : mostrarBienvenida ? (
              // Pantalla de bienvenida elegante (Versión 17)
              <div className="welcome-container">
                <div className="welcome-content">
                  <div className="welcome-text-section">
                    <h1 className="welcome-title">
                      BIENVENIDO {usuario.nombre?.toUpperCase()}
                    </h1>
                    <p className="welcome-subtitle">
                      Haz click en el botón para seleccionar tu torre
                    </p>
                  </div>

                  <button
                    onClick={handleAbrirMenuConTorre} // Llama a la función que ahora incluye handleSelectTipoNota
                    className="welcome-button"
                  >
                    Selecciona tu torre
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            ) : pantallaBlanca ? (
              <div className="pantalla-blanca"></div>
            ) : vista === "inicio" ? (
              <h1 className="title">BIENVENID@, {usuario.nombre?.toUpperCase()}</h1>
            ) : modoB2B && !torre ? (
              <TorreSelector onSelect={handleTorreSeleccionadaConSubmenu} />
            ) : vistaEspecial === "notasAvances" ? (
              <NotasAvances torre={torre}/>
            ) : vistaEspecial === "notasConciliacion" ? (
              <NotasConciliacion torre={torre} />
            ) : vistaEspecial === "notasSeguimiento" ? (
              <PlantillaSelector torre={torre} onSelect={() => {}} />
            ) : vistaEspecial === "plantillasAdicionales" ? (
              <PlantillasAdicionales torre={torre} />
            ) : vistaEspecial === "envioInicio" ||
              vistaEspecial === "envioCierre" ||
              vistaEspecial === "envioApertura" ||
              vistaEspecial === "envioPermisos" ? (
              <EnvioCorreos tipo={vistaEspecial} />
            ) : vistaEspecial === "alarma" ? (
              <Alarma />
            ) : vistaEspecial === "aplicativos" ? (
              <Aplicativos />
            ) : vistaEspecial === "novedadesAsesor" ? (
              <NovedadesAsesor />
            ) : vistaEspecial === "notasRapidas" ? (
              <NotasRapidas />
            ) : (
              !modoB2B && !torre && tipoNota && (
                <TorreSelector onSelect={handleTorreSeleccionadaConSubmenu} />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}