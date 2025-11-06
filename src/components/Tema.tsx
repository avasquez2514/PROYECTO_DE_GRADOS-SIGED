// src/components/Tema.tsx
"use client";

import React, { useEffect, useState } from "react";

const TEMA_CLASS = "dark-theme"; // La clase que tu CSS reconoce

const Tema = () => {
  const [darkMode, setDarkMode] = useState(false);

  // 1. useEffect de Inicialización: Carga el tema guardado al montar.
  useEffect(() => {
    const savedTheme = localStorage.getItem("tema");
    const isDark = savedTheme === "oscuro";
    
    setDarkMode(isDark); 

    // Aplica la clase correcta al <body> para la carga inicial
    if (isDark) {
      document.body.classList.add(TEMA_CLASS);
    } else {
      document.body.classList.remove(TEMA_CLASS);
    }
  }, []); 

  // 2. useEffect de Cambio: Aplica el nuevo tema y lo guarda.
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add(TEMA_CLASS); 
      localStorage.setItem("tema", "oscuro");
    } else {
      document.body.classList.remove(TEMA_CLASS); 
      localStorage.setItem("tema", "claro");
    }
  }, [darkMode]); 

  const toggleTheme = () => {
    setDarkMode(d => !d);
  };

  return (
    <button
      onClick={toggleTheme}
      className="nav-item nav-item-theme" // Clases para integrarse en la navbar
      title="Cambiar tema"
    >
      <span className="tema-icon">{darkMode ? "🌙" : "☀️"}</span>
      <span>{darkMode ? "Oscuro" : "Claro"}</span>
    </button>
  );
};

export default Tema;