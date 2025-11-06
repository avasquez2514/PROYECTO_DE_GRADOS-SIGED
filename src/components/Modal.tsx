"use client"; // Indica que este componente debe ejecutarse del lado del cliente (especialmente para Next.js)

import React, { ReactNode } from "react";
import { createPortal } from "react-dom"; // Para renderizar contenido fuera del DOM principal
import { FaSave, FaTimes } from "react-icons/fa"; // Iconos de cerrar y guardar
import "../styles/Modal.css"; // Estilos del modal

// 📘 Interfaz que define las propiedades (props) esperadas por el componente Modal
interface ModalProps {
  isOpen: boolean;           // Controla si el modal debe mostrarse
  onClose: () => void;       // Función que se ejecuta al cerrar el modal
  onSave?: () => void;       // (Opcional) Función para guardar cambios
  children: ReactNode;       // Contenido dinámico que se mostrará dentro del modal
}

// 🧠 Componente Modal
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, children }) => {
  // 🛑 Si el modal no está abierto, no renderiza nada
  if (!isOpen) return null;

  // 🔍 Busca el contenedor del modal en el DOM (normalmente en _app.tsx o index.html debe haber un div con id="modal-root")
  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    console.error("❌ No se encontró un elemento con id 'modal-root'.");
    return null;
  }

  // 🎯 Usa createPortal para renderizar el contenido del modal fuera del DOM principal
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {/* 🧩 Contenido del modal proporcionado desde el componente padre */}
        {children}

        {/* 💾 Botón guardar (solo si se pasa la función onSave) */}
        {onSave && (
          <button className="modal-save-button" onClick={onSave}>
            <FaSave style={{ marginRight: "8px" }} />
            Guardar
          </button>
        )}

        {/* ❌ Botón para cerrar el modal */}
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
    </div>,
    modalRoot // ⬅️ Lugar donde se inyecta el modal
  );
};

export default Modal;
