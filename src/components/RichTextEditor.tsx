"use client"; // Directiva de Next.js que indica que este componente es un componente de cliente (se ejecuta en el navegador).

// --- Importaciones de React y Tiptap (Editor de texto) ---
import { useEditor, EditorContent } from "@tiptap/react"; // Hooks principales para inicializar y usar el editor Tiptap.
import StarterKit from "@tiptap/starter-kit"; // Kit básico de extensiones (negrita, cursiva, listas, etc.).
import Image from "@tiptap/extension-image"; // Extensión para manejar imágenes en el editor.
import Placeholder from "@tiptap/extension-placeholder"; // Extensión para mostrar texto guía cuando el editor está vacío.
import TextAlign from "@tiptap/extension-text-align"; // Extensión para alinear texto (izquierda, centro, derecha).
import { TextStyle } from "@tiptap/extension-text-style"; // Extensión base para aplicar estilos de texto (color, fuente).
import Color from "@tiptap/extension-color"; // Extensión para manejar el color del texto.
import FontFamily from "@tiptap/extension-font-family"; // ✅ NUEVO IMPORT: Extensión para seleccionar la fuente del texto.
import { useCallback, useEffect, useState } from "react"; // Hooks de React.

// --- Importaciones de Librerías y Hooks Personalizados ---
import interact from "interactjs"; // Librería para interacciones (arrastrar, redimensionar elementos).
import { useResizable } from "../hooks/useResizable"; // Hook personalizado para la funcionalidad de redimensionamiento del editor.
import { supabase } from "../lib/supabaseClient"; // Cliente de Supabase para interactuar con la base de datos/almacenamiento.

// --- Importaciones de Iconos ---
import {
  FaBold,
  FaItalic,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaImage,
  FaTextHeight,
} from "react-icons/fa"; // Iconos de Font Awesome para la barra de herramientas.

// --- Importaciones de Estilos ---
import "../styles/envioCorreos.css"; // Estilos CSS específicos para este componente.

/**
 * @interface RichTextEditorProps
 * @description Define la estructura de las propiedades (props) que acepta el componente RichTextEditor.
 * @property {string} content Contenido HTML inicial del editor.
 * @property {(content: string) => void} onChange Función de callback que se llama cada vez que el contenido del editor cambia. Recibe el nuevo contenido HTML.
 * @property {string} [placeholder] Texto opcional que se muestra como marcador de posición.
 */
interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

/**
 * @function convertTextToTableGmail
 * @description Convierte datos de texto plano (típicamente copiados de Excel o con tabulaciones) en una tabla HTML
 * con estilos específicos para una mejor visualización en clientes de correo como Gmail.
 * @param {string} textData La cadena de texto con datos separados por saltos de línea y tabulaciones.
 * @returns {string} El código HTML de la tabla generada.
 */
const convertTextToTableGmail = (textData: string): string => {
  // Divide el texto en líneas y filtra las líneas vacías.
  const lines = textData.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return ""; // Retorna vacío si no hay líneas válidas.

  // Inicia la estructura HTML de la tabla con estilos de contenedor.
  let tableHTML =
    '<div style="margin: 15px 0; display: inline-block; max-width: 100%;">';
  // Define la tabla con estilos base (colapso de bordes, fuente por defecto para correo).
  tableHTML +=
    '<table style="border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; margin: 0 auto; border: 1px solid #dadce0; background-color: white;">';

  // Itera sobre cada línea para crear filas de la tabla.
  lines.forEach((line, index) => {
    // Divide la línea en celdas usando la tabulación (\t) como separador y elimina espacios.
    const cells = line.split("\t").map((cell) => cell.trim());
    // Solo procesa si hay más de una celda (indicando formato tabular).
    if (cells.length > 1) {
      tableHTML += "<tr>"; // Abre la etiqueta de fila.
      cells.forEach((cell) => {
        const isHeader = index === 0; // Determina si es la primera fila (encabezado).
        const tag = isHeader ? "th" : "td"; // Usa <th> para encabezados y <td> para datos.
        // Define los estilos CSS específicos para el encabezado o la celda de datos.
        const style = isHeader
          ? "padding: 8px 12px; border: 1px solid #dadce0; background-color: #f8f9fa; color: #3c4043; font-weight: 500; text-align: left; font-size: 14px;"
          : "padding: 8px 12px; border: 1px solid #dadce0; background-color: white; color: #3c4043; text-align: left; font-size: 14px;";
        // Añade la celda con su estilo y contenido.
        tableHTML += `<${tag} style="${style}">${cell}</${tag}>`;
      });
      tableHTML += "</tr>"; // Cierra la etiqueta de fila.
    }
  });

  tableHTML += "</table></div>"; // Cierra la etiqueta de tabla y el contenedor.
  return tableHTML; // Retorna el HTML de la tabla generado.
};

/**
 * @function cleanTableHTML
 * @description Limpia y estandariza el HTML de una tabla pegada (típicamente desde Word o una página web),
 * aplicando estilos consistentes para el correo.
 * @param {string} htmlData El código HTML de la tabla pegada.
 * @returns {string} El código HTML de la tabla estandarizada.
 */
const cleanTableHTML = (htmlData: string): string => {
  const parser = new DOMParser(); // Crea un parser para convertir la cadena HTML en un objeto DOM.
  const doc = parser.parseFromString(htmlData, "text/html"); // Parsea el HTML.
  const table = doc.querySelector("table"); // Selecciona el primer elemento <table> encontrado.
  if (!table) return htmlData; // Si no hay tabla, retorna el HTML original.

  // Aplica estilos consistentes a la etiqueta <table>.
  (table as HTMLElement).style.cssText =
    "border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; margin: 15px 0; border: 1px solid #dadce0; background-color: white;";

  const cells = table.querySelectorAll("td, th"); // Selecciona todas las celdas de datos y encabezado.
  // Itera sobre todas las celdas para aplicarles estilos consistentes.
  cells.forEach((cell) => {
    const htmlCell = cell as HTMLElement;
    const isHeader = htmlCell.tagName === "TH"; // Verifica si es una celda de encabezado.
    // Aplica estilos específicos según sea encabezado o celda de datos.
    htmlCell.style.cssText = isHeader
      ? "padding: 8px 12px; border: 1px solid #dadce0; background-color: #f8f9fa; color: #3c4043; font-weight: 500; text-align: left; font-size: 14px;"
      : "padding: 8px 12px; border: 1px solid #dadce0; background-color: white; color: #3c4043; text-align: left; font-size: 14px;";
  });

  // Retorna el HTML de la tabla envuelto en un contenedor para manejar márgenes y ancho.
  return `<div style="margin: 15px 0; display: inline-block; max-width: 100%;">${table.outerHTML}</div>`;
};

/**
 * @function uploadImage
 * @description Sube un archivo de imagen al almacenamiento de Supabase y obtiene su URL pública.
 * @param {File} file El objeto File de la imagen a subir.
 * @returns {Promise<string | null>} Una promesa que resuelve con la URL pública de la imagen o `null` si hay un error.
 */
const uploadImage = async (file: File): Promise<string | null> => {
  // Genera un nombre de archivo único para evitar colisiones.
  const fileName = `${Date.now()}-${file.name}`;
  try {
    // Sube el archivo al bucket 'imagenes-correo' de Supabase Storage.
    const { data, error } = await supabase.storage
      .from("imagenes-correo")
      .upload(fileName, file);

    if (error) throw error; // Lanza el error si la subida falla.

    // Obtiene la URL pública del archivo subido.
    const { data: publicUrlData } = supabase.storage
      .from("imagenes-correo")
      .getPublicUrl(fileName);

    return publicUrlData?.publicUrl || null; // Retorna la URL pública.
  } catch (err) {
    console.error("Error subiendo la imagen:", err); // Log del error en consola.
    return null; // Retorna null en caso de fallo.
  }
};

/**
 * @component
 * @name RichTextEditor
 * @description Componente principal de editor de texto enriquecido basado en Tiptap/ProseMirror,
 * con soporte para redimensionamiento, manejo de portapapeles (imágenes, tablas) y formato.
 * @param {RichTextEditorProps} props Las propiedades del editor.
 * @returns {JSX.Element} El elemento JSX que contiene el editor y su barra de herramientas.
 */
export default function RichTextEditor({
  content,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  // Estado para asegurar que el editor solo se inicialice en el cliente (evita errores de SSR).
  const [isClient, setIsClient] = useState(false);
  // Estado para controlar la fuente de letra seleccionada en la toolbar.
  const [fontFamily, setFontFamily] = useState("Calibri"); // ✅ Estado para el tipo de letra.
  // Hook personalizado para manejar la altura redimensionable del contenedor del editor.
  const { height, isResizing, containerRef, handleMouseDown } = useResizable({
    initialHeight: 200,
    minHeight: 100,
    maxHeight: 800,
  });

  // Efecto que se ejecuta solo una vez al montar el componente en el cliente.
  useEffect(() => setIsClient(true), []);

  // Inicialización del editor Tiptap usando el hook `useEditor`.
  const editor = useEditor({
    // Configuración de las extensiones del editor.
    extensions: [
      StarterKit, // Conjunto de funcionalidades básicas.
      Image.configure({ HTMLAttributes: { class: "editor-image" } }), // Imágenes con clase CSS.
      TextStyle, // Extensión base para estilos.
      Color, // Soporte para color.
      FontFamily.configure({ types: ["textStyle"] }), // ✅ Extensión agregada: Soporte para tipo de fuente.
      Placeholder.configure({
        // Configuración del texto de marcador de posición.
        placeholder:
          placeholder ||
          "Escribe tu mensaje aquí... (Puedes pegar tablas de Excel o imágenes con Ctrl+V)",
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }), // Alineación de texto para párrafos y encabezados.
    ],
    content: content || "", // Contenido inicial del editor.
    immediatelyRender: false, // Optimización de renderizado inicial.
    // Callback que se ejecuta en cada actualización de contenido.
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    // Propiedades adicionales del editor (manejo de eventos).
    editorProps: {
      attributes: { class: "editor-content" }, // Clase CSS para el área de edición.
      // Manejador personalizado para el evento de pegar contenido.
      handlePaste: async (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false; // No hay datos de portapapeles.

        const items = Array.from(clipboardData.items);
        // Busca si el portapapeles contiene un ítem de imagen.
        const imageItem = items.find((item) => item.type.startsWith("image/"));

        // --- Manejo de pegado de imágenes (Ctrl+V) ---
        if (imageItem) {
          const file = imageItem.getAsFile(); // Obtiene el objeto File de la imagen.
          if (file) {
            // Validación de tamaño máximo (5MB).
            if (file.size > 5 * 1024 * 1024) {
              alert("La imagen es demasiado grande (máx 5MB).");
              return true; // Bloquea la acción por defecto.
            }

            const imageUrl = await uploadImage(file); // Sube la imagen a Supabase.
            if (imageUrl) {
              // Inserta la imagen en el editor usando la URL pública.
              editor
                ?.chain()
                .focus()
                .setImage({ src: imageUrl, alt: "Imagen subida" })
                .run();
            } else {
              alert("Error al subir imagen desde el portapapeles.");
            }
          }
          return true; // Indica que el evento fue manejado.
        }

        // --- Manejo de pegado de HTML (Tablas de Word/Web) ---
        const htmlData = clipboardData.getData("text/html");
        if (htmlData && htmlData.includes("<table")) {
          const cleanedHTML = cleanTableHTML(htmlData); // Limpia y estandariza la tabla HTML.
          editor?.chain().focus().insertContent(cleanedHTML).run(); // Inserta la tabla limpia.
          return true; // Indica que el evento fue manejado.
        }

        // --- Manejo de pegado de Texto plano (Tablas de Excel) ---
        const textData = clipboardData.getData("text/plain");
        // Verifica si el texto contiene tabulaciones (\t) o espacios anchos (indicativos de tabla).
        if (textData && (textData.includes("\t") || textData.includes("  "))) {
          const tableHTML = convertTextToTableGmail(textData); // Convierte el texto a HTML de tabla.
          if (tableHTML) {
            editor?.chain().focus().insertContent(tableHTML).run(); // Inserta la tabla generada.
            return true; // Indica que el evento fue manejado.
          }
        }

        return false; // Permite que el comportamiento por defecto de Tiptap/navegador maneje otros pegados.
      },
    },
  });

  // Sincroniza el contenido del editor con la prop `content` cuando esta cambia externamente.
  useEffect(() => {
    // Solo actualiza si el editor existe y el contenido de la prop es diferente al actual del editor.
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  /**
   * @function addImageFromFile
   * @description Función de callback para manejar la selección de un archivo de imagen desde un input.
   * Sube la imagen seleccionada y la inserta en el editor.
   * @param {React.ChangeEvent<HTMLInputElement>} event El evento de cambio del input de archivo.
   */
  const addImageFromFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]; // Obtiene el archivo seleccionado.
      // Valida si el archivo es una imagen.
      if (!file || !file.type.startsWith("image/")) {
        event.target.value = ""; // Limpia el input de archivo.
        return;
      }

      // Validación de tamaño máximo (5MB).
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es demasiado grande (máx 5MB).");
        event.target.value = "";
        return;
      }

      const imageUrl = await uploadImage(file); // Sube la imagen a Supabase.
      if (imageUrl) {
        // Inserta la imagen en el editor.
        editor
          ?.chain()
          .focus()
          .setImage({ src: imageUrl, alt: file.name })
          .run();
      } else {
        alert("Error al subir la imagen al servidor.");
      }

      event.target.value = ""; // Limpia el input para permitir seleccionar el mismo archivo de nuevo.
    },
    [editor]
  );

  /**
   * @function toggleCase
   * @description Convierte el texto seleccionado a mayúsculas o minúsculas.
   * @param {boolean} toUpper `true` para convertir a mayúsculas, `false` para minúsculas.
   */
  const toggleCase = (toUpper: boolean) => {
    // Obtiene el texto actualmente seleccionado.
    const selection = editor?.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );
    if (selection) {
      // Aplica la transformación de mayúsculas/minúsculas.
      const newText = toUpper ? selection.toUpperCase() : selection.toLowerCase();
      // Reemplaza el contenido seleccionado con el nuevo texto transformado.
      editor?.chain().focus().insertContent(newText).run();
    }
  };

  // --- InteractJS para hacer elementos del editor (imágenes/tablas) movibles/redimensionables ---
  useEffect(() => {
    if (!editor) return; // Se asegura de que el editor esté inicializado.
    const root = editor.view.dom as HTMLElement; // Obtiene el elemento DOM raíz del editor.
    // Selector que encuentra todas las imágenes y tablas dentro del editor.
    const selector = () =>
      Array.from(root.querySelectorAll("img, table")) as HTMLElement[];

    // Función para aplicar la configuración de interactjs a los elementos.
    const applyInteract = () => {
      selector().forEach((el) => {
        if ((el as any).__interactInit) return; // Evita inicializar interactjs dos veces.
        (el as any).__interactInit = true;

        // Configuración de estilos para el manejo táctil y selección.
        el.style.touchAction = "none";
        el.style.userSelect = "none";
        el.style.maxWidth = "100%";

        // Asegura que las imágenes y elementos no tabulares se comporten como bloques de línea.
        if (getComputedStyle(el).display !== "table") {
          el.style.display = "inline-block";
          (el as HTMLElement).style.verticalAlign = "middle";
        }

        // --- Configuración de Draggable (Arrastrar) ---
        interact(el).draggable({
          inertia: true,
          modifiers: [
            // Restringe el arrastre dentro de los límites del editor.
            interact.modifiers.restrictRect({
              restriction: root,
              endOnly: true,
            }),
          ],
          listeners: {
            // Lógica ejecutada en cada movimiento de arrastre.
            move(event) {
              const target = event.target as HTMLElement;
              // Calcula las nuevas coordenadas (data-x, data-y) y aplica la transformación CSS.
              const dx =
                (parseFloat(target.getAttribute("data-x") || "0") || 0) + event.dx;
              const dy =
                (parseFloat(target.getAttribute("data-y") || "0") || 0) + event.dy;
              target.style.transform = `translate(${dx}px, ${dy}px)`;
              target.setAttribute("data-x", String(dx));
              target.setAttribute("data-y", String(dy));
            },
            // Lógica ejecutada al finalizar el arrastre.
            end() {
              // Notifica el cambio de contenido para guardar el nuevo estado.
              onChange(editor.getHTML());
            },
          },
        });

        // --- Configuración de Resizable (Redimensionar) ---
        interact(el).resizable({
          // Define los bordes que pueden usarse para redimensionar.
          edges: { left: true, right: true, bottom: true, top: false },
          inertia: true,
          listeners: {
            // Lógica ejecutada en cada movimiento de redimensionamiento.
            move(event) {
              const target = event.target as HTMLElement;
              const isImg = target.tagName.toLowerCase() === "img";
              const newWidth = event.rect.width; // Nuevo ancho del elemento.

              if (isImg) {
                const imgEl = target as HTMLImageElement;
                // Calcula el ratio de aspecto para mantener proporciones en imágenes.
                const ratio =
                  imgEl.naturalWidth && imgEl.naturalHeight
                    ? imgEl.naturalHeight / imgEl.naturalWidth
                    : undefined;
                // Limita el ancho mínimo y máximo (ancho del editor).
                target.style.width = `${Math.max(
                  40,
                  Math.min(newWidth, root.clientWidth)
                )}px`;
                // Aplica el alto proporcional si el ratio existe.
                if (ratio)
                  target.style.height = `${Math.round(newWidth * ratio)}px`;
              } else {
                // Para tablas, solo se aplica el ancho.
                target.style.width = `${Math.max(
                  40,
                  Math.min(newWidth, root.clientWidth)
                )}px`;
              }

              // Lógica de movimiento para mantener la posición al redimensionar.
              const dx =
                (parseFloat(target.getAttribute("data-x") || "0") || 0) +
                (event.deltaRect.left || 0);
              const dy =
                (parseFloat(target.getAttribute("data-y") || "0") || 0) +
                (event.deltaRect.top || 0);
              target.style.transform = `translate(${dx}px, ${dy}px)`;
              target.setAttribute("data-x", String(dx));
              target.setAttribute("data-y", String(dy));
            },
            // Lógica ejecutada al finalizar el redimensionamiento.
            end() {
              // Notifica el cambio de contenido para guardar el nuevo estado.
              onChange(editor.getHTML());
            },
          },
        });
      });
    };

    // Crea un MutationObserver para detectar dinámicamente nuevos elementos (imágenes/tablas)
    // añadidos o modificados en el editor y aplicarles interactjs.
    const obs = new MutationObserver(() => applyInteract());
    obs.observe(root, {
      childList: true, // Observa la adición/eliminación de nodos hijos.
      subtree: true, // Observa en todo el subárbol.
      attributes: true, // Observa cambios en atributos.
      attributeFilter: ["src", "style", "width"], // Solo observa estos atributos específicos.
    });

    applyInteract(); // Ejecuta la función por primera vez al montar.
    // Función de limpieza que se ejecuta al desmontar el componente.
    return () => {
      obs.disconnect(); // Detiene el observador de mutaciones.
    };
  }, [editor, onChange]); // Dependencias: se vuelve a ejecutar si el editor o onChange cambian.

  // Muestra un mensaje de carga si aún no está inicializado en el cliente.
  if (!isClient || !editor) {
    return <div className="editor-loading">Cargando editor...</div>;
  }

  // Estructura de renderizado del componente.
  return (
    // Contenedor principal, se usa `containerRef` para el redimensionamiento de altura.
    <div className="rich-text-editor" ref={containerRef}>
      {/* --- Toolbar (Barra de herramientas) --- */}
      <div className="editor-toolbar">
        {/* Botón para Negrita */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`toolbar-btn ${editor.isActive("bold") ? "active" : ""}`} // Clase 'active' si el formato está aplicado.
          title="Negrita"
        >
          <FaBold />
        </button>

        {/* Botón para Cursiva */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${editor.isActive("italic") ? "active" : ""}`}
          title="Cursiva"
        >
          <FaItalic />
        </button>

        {/* Botón para Alinear izquierda */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className="toolbar-btn"
          title="Alinear izquierda"
        >
          <FaAlignLeft />
        </button>

        {/* Botón para Centrar */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className="toolbar-btn"
          title="Centrar"
        >
          <FaAlignCenter />
        </button>

        {/* Botón para Alinear derecha */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className="toolbar-btn"
          title="Alinear derecha"
        >
          <FaAlignRight />
        </button>

        {/* Input para seleccionar Color de Texto */}
        <input
          type="color"
          // Aplica el color de texto seleccionado.
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          title="Color de texto"
        />

        {/* Botón para convertir a Mayúsculas */}
        <button onClick={() => toggleCase(true)} title="Mayúsculas">
          <FaTextHeight style={{ transform: "rotate(180deg)" }} /> ABC
        </button>

        {/* Botón para convertir a Minúsculas */}
        <button onClick={() => toggleCase(false)} title="Minúsculas">
          <FaTextHeight /> abc
        </button>

        {/* Input de archivo oculto para la subida de imágenes */}
        <input
          type="file"
          accept="image/*"
          onChange={addImageFromFile} // Llama al manejador de subida al seleccionar un archivo.
          id="image-upload"
          hidden // Input visible solo al hacer clic en el botón asociado.
        />
        {/* Botón para Insertar Imagen (simula un clic en el input de archivo) */}
        <button
          onClick={() => document.getElementById("image-upload")?.click()}
          title="Insertar imagen"
        >
          <FaImage />
        </button>

        {/* ✅ Selector de tipo de letra */}
        <select
          value={fontFamily} // Valor actual del estado.
          onChange={(e) => {
            const newFont = e.target.value;
            setFontFamily(newFont); // Actualiza el estado.
            if (editor) {
              // 🔹 Aplica el cambio de fuente al texto seleccionado o al siguiente texto.
              editor.chain().focus().setMark("textStyle", { fontFamily: newFont }).run();
              // Aplica el cambio a los atributos de estilo existentes (necesario en algunos casos).
              editor.chain().focus().updateAttributes("textStyle", { fontFamily: newFont }).run();
              // ✅ fuerza el cambio visual global al contenedor principal (importante para una UX fluida).
              editor.view.dom.style.fontFamily = newFont; 
            }
          }}
          title="Tipo de letra"
          // Estilos inline para el selector.
          style={{
            marginLeft: "8px",
            padding: "4px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontFamily, // Aplica el estilo de fuente al selector mismo.
          }}
        >
          {/* Opciones de fuente con estilo para previsualización */}
          <option value="Calibri" style={{ fontFamily: "Calibri" }}>Calibri</option>
          <option value="Arial" style={{ fontFamily: "Arial" }}>Arial</option>
          <option value="Times New Roman" style={{ fontFamily: "Times New Roman" }}>Times New Roman</option>
          <option value="Verdana" style={{ fontFamily: "Verdana" }}>Verdana</option>
          <option value="Tahoma" style={{ fontFamily: "Tahoma" }}>Tahoma</option>
          <option value="Courier New" style={{ fontFamily: "Courier New" }}>Courier New</option>
          <option value="Georgia" style={{ fontFamily: "Georgia" }}>Georgia</option>
        </select>
      </div>

      {/* --- Editor (Área de contenido) --- */}
      <div className="editor-wrapper">
        <EditorContent
          editor={editor} // Pasa la instancia del editor Tiptap.
          // Aplica la altura redimensionada y la fuente seleccionada.
          style={{ height: `${height}px`, fontFamily }} // ✅ fuente aplicada
        />
        {/* Manipulador de redimensionamiento */}
        <div
          onMouseDown={handleMouseDown} // Inicia el proceso de redimensionamiento.
          className={`resize-handle ${isResizing ? "active" : ""}`} // Clase 'active' durante el redimensionamiento.
          title="Arrastra para redimensionar"
        />
      </div>
    </div>
  );
}