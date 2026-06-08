import { Package, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import type { View } from '@type/View';
import { canAccessView } from '@utils/sidebar.permissions';
import { VIEWS_CONFIG } from '@utils/views.config';
import { ROLE_CONFIG } from '@utils/role.config';
import { motion } from 'motion/react';
import { useAppContext } from '@context/AppContext';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@components/ui/resizable";
interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ currentView, onNavigate, onLogout, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { currentUser, systemConfig } = useAppContext();
  const user = currentUser;
  const visibleMenuItems = VIEWS_CONFIG.filter(view => canAccessView(user, view.id));

  const getRoleLabel = (role: string) => {
    return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]?.label || role;
  };

  const getRoleBadgeColor = (role: string) => {
    return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 
      ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <ResizablePanelGroup direction="vertical" autoSaveId="sidebar-panels">
        {/* Header */}
        <ResizablePanel className="p-4 " id="sidebar-header" minSize={5} defaultSize={5}>
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 rounded-lg p-2">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <motion.h2
                    key={systemConfig?.companyName}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="font-semibold text-gray-900 text-sm"
                  >
                    {systemConfig?.companyName || "Almacen"}
                  </motion.h2>
                  <motion.p
                    key={systemConfig?.defaultLocation}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-xs text-gray-500"
                  >
                    {systemConfig?.defaultLocation || "Control"}
                  </motion.p>
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
        </ResizablePanel>
        <ResizableHandle />

        {/* User info */}
        <ResizablePanel id='sidebar-user' className="p-4" minSize={4} defaultSize={9} >
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
        </ResizablePanel>

        <ResizableHandle />
        <ResizablePanel id='sidebar-menu'>
          {/* Menu items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {visibleMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5 shrink-0" />
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
        </ResizablePanel>

        {/* System Version */}
        <ResizablePanel id='sidebar-version' maxSize={3} defaultSize={2} collapsible>
          <div className="px-4 pb-2" >
            {!isCollapsed && (
              <motion.p
                key={__APP_VERSION__}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 10.0 }}
                className="text-xs text-gray-400"
              >
                v. {__APP_VERSION__}
              </motion.p>
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle />
        {/* Logout button */}
        <ResizablePanel id='sidebar-logout' className="p-4 border-t border-gray-200" minSize={5} defaultSize={5} maxSize={5} >
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors
            ${isCollapsed ? 'justify-center' : ''
              }`}
            title={isCollapsed ? 'Cerrar Sesión' : ''}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-medium text-sm">Cerrar Sesión</span>}
          </button>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div >
  );
}
