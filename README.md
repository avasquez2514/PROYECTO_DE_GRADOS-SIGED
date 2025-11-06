# 💻 Servicio Web Energía Integral Andina

[![Estado del Proyecto](https://img.shields.io/badge/STATUS-FINALIZADO-brightgreen)]([URL-DEL-PROYECTO-EN-RENDER])
[![Tecnología Principal](https://img.shields.io/badge/Frontend-Next.js-000000)](https://nextjs.org/)
[![Base de Datos](https://img.shields.io/badge/Base%20de%20Datos-Supabase-3ecf8e)](https://supabase.com/)

## ✨ Resumen del Proyecto

Este proyecto consiste en el diseño e implementación de un **Sistema Web Integral** para el área de **Despacho B2B de Energía Integral Andina**, contratista de TIGO.

El propósito principal es **automatizar y optimizar la gestión operativa** de procesos críticos que antes se realizaban manualmente, tales como el registro de notas, la asignación de rutas y el control de herramientas técnicas. La plataforma centraliza la información para mejorar la eficiencia operativa, fortalecer la trazabilidad y elevar la calidad del servicio.

## 🚀 Funcionalidades Destacadas

* **Automatización de Notas y Documentación:** Sistema centralizado para el registro de actividades.
* **Gestión de Rutas:** Optimización y seguimiento de la asignación de rutas de despacho.
* **Control de Inventario:** Supervisión digital del inventario y control de herramientas técnicas.
* **Seguridad y Roles:** Autenticación de usuarios basada en roles con **JSON Web Tokens (JWT)** para proteger los módulos internos.

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (React)** | Framework para el desarrollo de la interfaz de usuario. |
| **Backend** | **JWT (JSON Web Tokens)** | Utilizado para la autenticación segura y el control de acceso. |
| **Base de Datos** | **Supabase** | Solución de base de datos *open source* para garantizar rendimiento y escalabilidad. |
| **Despliegue** | **Render** | Plataforma de alojamiento para el *frontend* con soporte para CI/CD. |

## ⚙️ Instalación Local

Sigue estos pasos para obtener una copia local del proyecto y ponerlo en marcha para desarrollo.

### 1. Prerrequisitos

Asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (versión LTS recomendada)
* npm o yarn
* Git

### 2. Clonar el Repositorio

```bash
git clone [URL-DE-TU-REPOSITORIO]
cd [NOMBRE-DEL-PROYECTO]

3. Instalar Dependencias
npm install
# o yarn install

4. Configuración de Variables de Entorno
Crea un archivo llamado .env.local en la raíz del proyecto y configura las variables de entorno necesarias para la conexión con Supabase y el manejo de tokens

# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL="[TU_SUPABASE_URL]"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[TU_SUPABASE_ANON_KEY]"

# Clave Secreta para Tokens JWT
JWT_SECRET_KEY="[TU_CLAVE_SECRETA]"


5. Ejecutar en Modo Desarrollo
npm run dev
# o yarn dev

La aplicación estará accesible en tu navegador en http://localhost:4000.


☁️ Despliegue

El despliegue del sistema web se realizó utilizando la siguiente arquitectura:

Frontend (Next.js): Desplegado en la plataforma Render por su facilidad de integración con GitHub y su soporte para Implementaciones Continuas (CI/CD).

Base de Datos: Gestionada a través de Supabase.

👥 Desarrolladores

Rol	Nombre
Estudiante	Anderson Vasquez Gonzalez
Asesor(es)	Diana Maria Rico Mesa
Institución	Instituto Tecnológico Metropolitano (ITM)
Fecha de Entrega	06/10/2025