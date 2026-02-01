import type { View } from '@/app/types/View';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Users,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export interface ViewConfig {
  id: View;
  label: string;
  icon: any;
  badge?: number;
}

export const VIEWS_CONFIG: ViewConfig[] = [
  // Dashboard - Todos
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },

  // Admin - 5 funcionalidades
  { id: 'inventory', label: 'Gestionar Inventario', icon: Package },
  { id: 'users', label: 'Gestionar Usuarios', icon: Users },
  { id: 'settings', label: 'Configuracion Sistema', icon: Settings },
  { id: 'reports', label: 'Reportes Generales', icon: FileText },

  // Manager - 4 funcionalidades
  { id: 'supervise', label: 'Supervisar Inventario', icon: Package },
  { id: 'approve', label: 'Aprobar Movimientos', icon: CheckCircle },
  { id: 'incidents', label: 'Ajustar por Incidencias', icon: AlertTriangle },
  { id: 'manager-reports', label: 'Reportes de Inventario', icon: FileText },

  // Operador - 4 funcionalidades
  { id: 'register-entry', label: 'Registrar Entradas', icon: TrendingUp },
  { id: 'register-exit', label: 'Registrar Salidas', icon: TrendingUp },
  { id: 'consult-inventory', label: 'Consultar Inventario', icon: Package },
  { id: 'report-incident', label: 'Registrar Incidencias', icon: AlertTriangle },

  // Auditor - 4 funcionalidades
  { id: 'export-audit', label: 'Exportar para Auditoria', icon: FileText },
  { id: 'audit-inventory', label: 'Consultar Inventario', icon: Package },
  { id: 'audit-movements', label: 'Historial de Movimientos', icon: TrendingUp },
  { id: 'audit-reports', label: 'Generar Reportes', icon: FileText },
];