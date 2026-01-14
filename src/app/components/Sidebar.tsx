import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Users, 
  FileText, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  AlertTriangle,
  CheckCircle,
  Edit
} from 'lucide-react';

interface User {
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'auditor';
  name: string;
}

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: User;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  roles: ('admin' | 'manager' | 'operator' | 'auditor')[];
  badge?: number;
}

export function Sidebar({ currentView, onNavigate, user, onLogout, isCollapsed, onToggleCollapse }: SidebarProps) {
  const menuItems: MenuItem[] = [
    // Dashboard - Todos
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'operator', 'auditor']
    },
    // Admin - 5 funcionalidades
    {
      id: 'inventory',
      label: 'Gestionar Inventario',
      icon: Package,
      roles: ['admin']
    },
    {
      id: 'users',
      label: 'Gestionar Usuarios',
      icon: Users,
      roles: ['admin']
    },
    {
      id: 'settings',
      label: 'Configuración Sistema',
      icon: Settings,
      roles: ['admin']
    },
    {
      id: 'reports',
      label: 'Reportes Generales',
      icon: FileText,
      roles: ['admin']
    },
    // Manager - 4 funcionalidades
    {
      id: 'supervise',
      label: 'Supervisar Inventario',
      icon: Package,
      roles: ['manager']
    },
    {
      id: 'approve',
      label: 'Aprobar Movimientos',
      icon: CheckCircle,
      roles: ['manager']
    },
    {
      id: 'incidents',
      label: 'Ajustar por Incidencias',
      icon: AlertTriangle,
      roles: ['manager']
    },
    {
      id: 'manager-reports',
      label: 'Reportes de Inventario',
      icon: FileText,
      roles: ['manager']
    },
    // Operador - 4 funcionalidades
    {
      id: 'register-entry',
      label: 'Registrar Entradas',
      icon: TrendingUp,
      roles: ['operator']
    },
    {
      id: 'register-exit',
      label: 'Registrar Salidas',
      icon: TrendingUp,
      roles: ['operator']
    },
    {
      id: 'consult-inventory',
      label: 'Consultar Inventario',
      icon: Package,
      roles: ['operator']
    },
    {
      id: 'report-incident',
      label: 'Registrar Incidencias',
      icon: AlertTriangle,
      roles: ['operator']
    },
    // Auditor - 4 funcionalidades
    {
      id: 'audit-inventory',
      label: 'Consultar Inventario',
      icon: Package,
      roles: ['auditor']
    },
    {
      id: 'audit-movements',
      label: 'Historial de Movimientos',
      icon: TrendingUp,
      roles: ['auditor']
    },
    {
      id: 'audit-reports',
      label: 'Generar Reportes',
      icon: FileText,
      roles: ['auditor']
    },
    {
      id: 'export-audit',
      label: 'Exportar para Auditoría',
      icon: FileText,
      roles: ['auditor']
    }
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const getRoleLabel = (role: string) => {
    const roles: { [key: string]: string } = {
      admin: 'Administrador',
      manager: 'Manager',
      operator: 'Operador',
      auditor: 'Auditor'
    };
    return roles[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      operator: 'bg-green-100 text-green-800',
      auditor: 'bg-orange-100 text-orange-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 rounded-lg p-2">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Almacén</h2>
                <p className="text-xs text-gray-500">Control</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-200">
        {isCollapsed ? (
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
              {getRoleLabel(user.role)}
            </span>
          </div>
        )}
      </div>

      {/* Menu items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleMenuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              {!isCollapsed && item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Cerrar Sesión' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}
