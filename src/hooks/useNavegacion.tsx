// src/hooks/useNavegacion.ts
import { useState } from "react";

/**
 * 🔁 Hook personalizado para gestionar:
 * - el tipo de nota seleccionada
 * - la torre seleccionada
 * - vistas especiales (como aplicativos, alarmas, correos)
 * - control de vista en blanco y modo B2B
 */
export function useNavegacion() {
  const [tipoNota, setTipoNota] = useState<string>("");
  const [torre, setTorre] = useState<string>("");
  const [pantallaBlanca, setPantallaBlanca] = useState<boolean>(false);
  const [modoB2B, setModoB2B] = useState<boolean>(false);
  const [vista, setVista] = useState<string>("inicio");
  const [vistaEspecial, setVistaEspecial] = useState<string>("");

  /**
   * ✅ Maneja la selección del tipo de nota
   */
  const handleSelectTipoNota = (nota: string) => {
    setTipoNota(nota);
    setVistaEspecial("");
    setPantallaBlanca(false);

    if (nota === "DESPACHO B2B") {
      setModoB2B(true);
      setTorre(""); // Reinicia selección de torre
    } else {
      setModoB2B(false);
    }

    setVista(""); // Limpia la vista para que se actualice dinámicamente
  };

  /**
   * ✅ Maneja la selección de una torre
   */
  const handleTorreSeleccionada = (torreSeleccionada: string) => {
    setTorre(torreSeleccionada);
    setPantallaBlanca(true);
  };

  /**
   * ✅ Activa una vista especial (como alarmas, aplicativos, etc.)
   */
  const handleVistaEspecial = (vista: string) => {
    setVistaEspecial(vista);
    setTipoNota("");
    setPantallaBlanca(false);
  };

  /**
   * 🔄 Reinicia todo a su estado inicial
   */
  const handleVolverInicio = () => {
    setVista("inicio");
    setTipoNota("");
    setTorre("");
    setModoB2B(false);
    setVistaEspecial("");
    setPantallaBlanca(false);
  };

  return {
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
  };
}
