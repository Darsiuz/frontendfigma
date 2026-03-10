import { ViewConfig, type View } from '@type/View';
import { LayoutDashboard, Package, TrendingUp, Users, FileText, Settings, AlertTriangle, CheckCircle } from 'lucide-react';

// ACA SE CAMBIA EL ORDEN DE LOS ITEMS EN EL SIDEBAR, ASI COMO LOS ICONOS Y LOS LABELS
export const VIEWS_CONFIG: ViewConfig[] = [
  // Dashboard - Todos
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },

  // Admin
  { id: 'users', label: 'Gestionar Usuarios', icon: Users },
  { id: 'inventory', label: 'Gestionar Inventario', icon: Package },
  { id: 'reports', label: 'Reportes Generales', icon: FileText },

  // Manager
  { id: 'supervise', label: 'Supervisar Inventario', icon: Package },
  { id: 'approve', label: 'Aprobar Movimientos', icon: CheckCircle },
  { id: 'incidents', label: 'Ajustar por Incidencias', icon: AlertTriangle },
  { id: 'manager-reports', label: 'Reportes de Inventario', icon: FileText },

  // Operador
  { id: 'consult-inventory', label: 'Consultar Inventario', icon: Package },
  { id: 'register-movements', label: 'Registrar Movimientos', icon: TrendingUp },
  { id: 'report-incident', label: 'Registrar Incidencias', icon: AlertTriangle },

  // Auditor
  { id: 'audit-reports', label: 'Generar Reportes', icon: FileText },
  { id: 'audit-inventory', label: 'Consultar Inventario', icon: Package },
  { id: 'audit-movements', label: 'Historial de Movimientos', icon: TrendingUp },

  
  { id: 'settings', label: 'Configuracion Sistema', icon: Settings },
];

// Solo es para obtener un label en el header
export const getViewLabel = (view: View): string => {
  const found = VIEWS_CONFIG.find(v => v.id === view);
  return found?.label ?? 'Dashboard';
};