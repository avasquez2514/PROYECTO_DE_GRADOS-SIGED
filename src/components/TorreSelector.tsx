"use client"; // Directiva de Next.js que indica que este componente es un componente de cliente (se ejecuta en el navegador).

import React from "react"; // Importa la librería principal de React.
import "../styles/torreSelector.css"; // Importa los estilos CSS específicos para este componente.

/**
 * @interface TorreSelectorProps
 * @description Define la estructura de las propiedades (props) que acepta el componente TorreSelector.
 * @property {function(string): void} onSelect Función de callback que se ejecuta cuando se selecciona una torre.
 * Recibe como argumento la cadena de texto de la torre seleccionada.
 */
interface TorreSelectorProps {
  onSelect: (torre: string) => void;
}

/**
 * @component
 * @name TorreSelector
 * @description Componente funcional de React que permite al usuario seleccionar una "torre" de una lista predefinida.
 * @param {TorreSelectorProps} props Las propiedades pasadas al componente, incluyendo la función `onSelect`.
 * @returns {JSX.Element} El elemento JSX que representa el selector de torres.
 */
const TorreSelector: React.FC<TorreSelectorProps> = ({ onSelect }) => {
  // Define un array de cadenas de texto con los nombres de las torres disponibles.
  const torres: string[] = [
    "ANTIOQUIA CENTRO",
    "ANTIOQUIA ORIENTE",
    "EDATEL",
    "BOGOTA",
    "OPC_BASIC",
    "SANTANDER",
    "COSTA"
  ];

  // Inicia la estructura JSX que será renderizada por el componente.
  return (
    // Contenedor principal del selector de torres con su clase CSS.
    <div className="torre-selector-container">
      {/* Título o encabezado que indica al usuario la acción a realizar. */}
      <h2 className="torre-selector-title">SELECCIONA TU TORRE:</h2>

      {/* Contenedor para agrupar los botones de selección de torres. */}
      <div className="torre-buttons">
        {/* Mapea (itera) sobre el array `torres` para crear un botón por cada torre. */}
        {torres.map((torre) => (
          // Inicia la definición de un botón para cada elemento del array.
          <button
            // La clave única (key) es esencial en React para la renderización de listas y debe ser el nombre de la torre.
            key={torre}
            // Clase CSS para estilizar cada botón.
            className="torre-button"
            // Manejador de eventos que se ejecuta al hacer clic en el botón.
            // Llama a la función `onSelect` pasada por props, enviándole el nombre de la torre actual.
            onClick={() => onSelect(torre)}
          >
            {/* Muestra el nombre de la torre como texto dentro del botón. */}
            {torre}
          </button>
        ))}
      </div>
    </div>
  );
};

// Exporta el componente `TorreSelector` para que pueda ser utilizado en otras partes de la aplicación.
export default TorreSelector;