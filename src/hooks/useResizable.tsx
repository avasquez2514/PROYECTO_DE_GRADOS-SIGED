"use client";

import React, { useRef, useState, useCallback } from 'react';

/**
 * Interfaz que define las propiedades opcionales para configurar el hook `useResizable`.
 * Permite establecer alturas iniciales, mínimas y máximas del contenedor redimensionable.
 */
interface UseResizableProps {
  /** Altura inicial del contenedor (por defecto 200px). */
  initialHeight?: number;
  /** Altura mínima que puede alcanzar el contenedor (por defecto 100px). */
  minHeight?: number;
  /** Altura máxima que puede alcanzar el contenedor (por defecto 800px). */
  maxHeight?: number;
}

/**
 * Hook personalizado que permite que un elemento HTML sea redimensionable en altura
 * mediante el arrastre del mouse.
 *
 * @param {UseResizableProps} options - Configuración opcional del hook.
 * @returns Un objeto con las siguientes propiedades:
 * - `height`: altura actual del contenedor.
 * - `isResizing`: indica si el usuario está redimensionando.
 * - `containerRef`: referencia al contenedor HTML.
 * - `handleMouseDown`: función que inicia el proceso de redimensionamiento.

 */
export const useResizable = ({ 
  initialHeight = 200, 
  minHeight = 100, 
  maxHeight = 800 
}: UseResizableProps = {}) => {
  
  // Estado que almacena la altura actual del contenedor.
  const [height, setHeight] = useState(initialHeight);
  
  // Estado que indica si el usuario está arrastrando para redimensionar.
  const [isResizing, setIsResizing] = useState(false);
  
  // Referencia al elemento contenedor redimensionable.
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Guarda la posición vertical del mouse al iniciar el arrastre.
  const startYRef = useRef(0);
  
  // Guarda la altura del contenedor al iniciar el arrastre.
  const startHeightRef = useRef(0);

  /**
   * Función que se ejecuta al presionar el mouse sobre el área de redimensionamiento.
   * Inicia el proceso de cambio de altura y modifica el cursor del documento.
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    
    // Cambiar el cursor y desactivar la selección de texto durante el arrastre
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [height]);

  /**
   * Función que se ejecuta mientras el mouse se mueve durante el arrastre.
   * Calcula la nueva altura y aplica límites establecidos por minHeight y maxHeight.
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaY = e.clientY - startYRef.current;
    const newHeight = startHeightRef.current + deltaY;
    
    // Aplicar límites de altura
    const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
    setHeight(constrainedHeight);
  }, [isResizing, minHeight, maxHeight]);

  /**
   * Función que se ejecuta al soltar el mouse.
   * Finaliza el redimensionamiento y restaura el cursor a su estado original.
   */
  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;
    
    setIsResizing(false);
    
    // Restaurar el cursor del documento
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [isResizing]);

  /**
   * Efecto que agrega y elimina los event listeners globales
   * cuando el usuario está redimensionando.
   */
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Retorna los valores y funciones necesarias para usar el hook.
  return {
    height,
    isResizing,
    containerRef,
    handleMouseDown,
  };
};
