import type { User as U } from '@type/User';

export const ADMIN = (u: U) => u.role === 'admin';
export const MANAGER = (u: U) => u.role === 'manager';
export const OPERATOR = (u: U) => u.role === 'operator';
export const AUDITOR = (u: U) => u.role === 'auditor';


// Permisos de ACCION / DOMINIO

// Vistas
export const canViewSystemSettings = (u: U) =>
  ADMIN(u) || MANAGER(u) || OPERATOR(u) || AUDITOR(u);

export const canEditSystemSettings = (u: U) =>
  ADMIN(u);

// Productos
export const canCreateProduct = (u: U) =>
  ADMIN(u) || MANAGER(u);

export const canEditProduct = (u: U) =>
  ADMIN(u) || MANAGER(u);

export const canDeleteProduct = (u: U) =>
  ADMIN(u);

export const canViewProduct = (u: U) =>
  ADMIN(u) || MANAGER(u) || OPERATOR(u) || AUDITOR(u);

// Movimientos
export const canCreateMovement = (u: U) =>
  ADMIN(u) || OPERATOR(u);

export const canApproveMovement = (u: U) =>
  ADMIN(u) || MANAGER(u);

export const canViewMovements = (u: U) =>
  ADMIN(u) || MANAGER(u) || OPERATOR(u) || AUDITOR(u);

// Incidentes
export const canCreateIncident = (u: U) =>
  ADMIN(u) || OPERATOR(u);

export const canResolveIncident = (u: U) =>
  ADMIN(u) || MANAGER(u);

export const canViewIncidents = (u: U) =>
  ADMIN(u) || MANAGER(u) || OPERATOR(u) || AUDITOR(u);

// Reportes
export const canViewReports = (u: U) =>
  ADMIN(u) || MANAGER(u) || AUDITOR(u);

// Usuarios
export const canManageUsers = (u: U) =>
  ADMIN(u);

// Vistas del sidebar
export const canViewDashboard = (u: U) =>
  ADMIN(u) || MANAGER(u) || OPERATOR(u) || AUDITOR(u);

