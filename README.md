
# README – FRONTEND (React + TypeScript)

```markdown
# Sistema de Control de Almacen – Frontend

## Descripcion

Aplicacion web desarrollada con React y TypeScript que consume la API REST del sistema de control de almacen.

Permite gestionar productos, movimientos, incidencias y reportes, aplicando control de vistas por rol y arquitectura modular basada en hooks personalizados.

Este proyecto forma parte del curso de Diseño de Patrones de Software.

---

## Arquitectura Frontend

El proyecto esta organizado por features:

- features/auth
- features/products
- features/movements
- features/incidents
- features/system

Se implementa separacion clara entre:

- Componentes UI
- Logica de negocio (Custom Hooks)
- Servicios de consumo API
- Permisos centralizados

---

## Patrones Aplicados

- Custom Hooks Pattern
- Separation of Concerns
- RBAC (Control de permisos en vistas)
- Observer Pattern (React State)
- Modular Architecture

---

## Autenticacion

- JWT almacenado en localStorage
- Logout automatico ante error 401
- Renderizado condicional segun rol
- Control de permisos centralizado en `permissions.ts`

---

## Funcionalidades

- Dashboard con metricas y graficos
- Gestion de productos
- Registro y aprobacion de movimientos
- Gestion de incidencias
- Configuracion del sistema
- Reportes
- Control de acceso por rol

---

## Tecnologias Utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React (iconos)
- Sonner (notificaciones toast)

---

## Ejecucion del Proyecto

  Para correr proyecto tienes que instalar la dependencia con `npm i`.
  Si sale un error al instalar dependencias puedes usar `npm audit fix` para corregirlo
  Luego correr el proyecto con `npm run dev`

  Opcionalmente se puede crear un archivo .env 
  dentro de `.env` :
  `VITE_API_URL = "http://localhost:8080"`
  en donde va la ruta que usarian para conectarse a la api, en este caso localhost:8080
  