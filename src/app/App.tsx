import { useState, useEffect } from 'react';
import { Login } from '@/app/components/Login';
import { Sidebar } from '@/app/components/Sidebar';
import { DashboardView } from '@/app/components/DashboardView';
import { InventoryManagement } from '@/app/components/InventoryManagement';
import { StockMovements } from '@/app/components/StockMovements';
import { UserManagement } from '@/app/components/UserManagement';
import { Reports } from '@/app/components/Reports';
import { ProductForm } from '@/app/components/ProductForm';
import { SystemSettings } from '@/app/components/SystemSettings';
import { IncidentManagement } from '@/app/components/IncidentManagement';
import { ApproveMovements } from '@/app/components/ApproveMovements';
import { getDefaultViewByRole } from '@/app/utils/defaultViewByRole';
import { getViewLabel } from '@/app/utils/views.helpers';

import { Product } from '@/app/types/Product';
import { MovementStatus } from '@/app/types/Movement';

import { canAccessView } from '@/app/utils/sidebar.permissions';

import type { View } from '@/app/types/View';
import { useMovements } from '@/app/features/movements/useMovements';
import { useIncidents } from '@/app/features/incidents/useIncidents';
import { useProducts } from '@/app/features/products/useProducts';
import { useSystemConfig } from '@/app/features/system/useSystemConfig';
import { useAuth } from "@/app/features/auth/useAuth";

function App() {
  const { isLoggedIn, currentUser, authLoading, handleLogin, handleLogout, } = useAuth();

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { products, setProducts, handleAddProduct, handleEditProduct, handleDeleteProduct } = useProducts({ user: currentUser });
  const { movements, handleAddMovement, handleApproveMovement, handleRejectMovement } = useMovements({ user: currentUser, products, setProducts });
  const { incidents, handleAddIncident, handleResolveIncident } = useIncidents({ user: currentUser });
  const { systemConfig, handleSaveConfig, } = useSystemConfig({ user: currentUser });

  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Redirigir al que no tiene acceso a la vista actual
  useEffect(() => {
    if (currentUser && !canAccessView(currentUser, currentView)) {
      setCurrentView(getDefaultViewByRole(currentUser));
    }
  }, [currentView, currentUser]);

  if (!isLoggedIn || !currentUser) {
    return (
      <Login
        onLogin={async (email, password) => {
          const user = await handleLogin(email, password);

          if (user) {
            setCurrentView(getDefaultViewByRole(user));
          }
        }}
      />
    );
  }

  const canRenderView = currentUser ? canAccessView(currentUser, currentView) : false;
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-gray-600 text-lg">
          Cargando permisos...
        </span>
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={currentUser}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        systemConfig={systemConfig}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getViewLabel(currentView)}</h1>
              <p className="text-sm text-gray-600 mt-1">Bienvenido, {currentUser.name}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {!canRenderView ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Acceso restringido :V
                </h2>
                <p className="text-gray-600 mt-2">
                  No tienes permisos para acceder a esta seccion
                </p>
              </div>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' &&
                <DashboardView
                  products={products}
                  movements={movements}
                  systemConfig={systemConfig}
                  incidents={incidents}
                  user={currentUser}
                />
              }

              {/* Admin */}
              {currentView === 'inventory' && <InventoryManagement products={products} onEdit={(p) => { setEditingProduct(p); setIsProductFormOpen(true); }} onDelete={handleDeleteProduct} onAdd={() => { setEditingProduct(null); setIsProductFormOpen(true); }} user={currentUser} />}
              {currentView === 'users' && <UserManagement />}
              {currentView === 'reports' && <Reports products={products} movements={movements.filter(m => m.status === MovementStatus.APROBADO)} />}
              {currentView === 'settings' && systemConfig && (<SystemSettings config={systemConfig} onSave={handleSaveConfig} />)}

              {/* Manager */}
              {currentView === 'supervise' && <InventoryManagement products={products} onEdit={(p) => { setEditingProduct(p); setIsProductFormOpen(true); }} onDelete={handleDeleteProduct} onAdd={() => { setEditingProduct(null); setIsProductFormOpen(true); }} user={currentUser} />}
              {currentView === 'approve' && <ApproveMovements movements={movements} onApprove={handleApproveMovement} onReject={handleRejectMovement} />}
              {currentView === 'incidents' && <IncidentManagement products={products} incidents={incidents} onAddIncident={handleAddIncident} onResolveIncident={handleResolveIncident} user={currentUser} />}
              {currentView === 'manager-reports' && <Reports products={products} movements={movements.filter(m => m.status === MovementStatus.APROBADO)} />}

              {/* Operator */}
              {currentView === 'register-movements' && <StockMovements products={products} movements={movements} onAddMovement={handleAddMovement} user={currentUser} />}
              {currentView === 'consult-inventory' && <InventoryManagement products={products} onEdit={(p) => { }} onDelete={() => { }} onAdd={() => { }} user={currentUser} />}
              {currentView === 'report-incident' && <IncidentManagement products={products} incidents={incidents} onAddIncident={handleAddIncident} onResolveIncident={handleResolveIncident} user={currentUser} />}

              {/* Auditor */}
              {currentView === 'audit-inventory' && <InventoryManagement products={products} onEdit={(p) => { }} onDelete={() => { }} onAdd={() => { }} user={currentUser} />}
              {currentView === 'audit-movements' && <StockMovements products={products} movements={movements.filter(m => m.status === MovementStatus.APROBADO)} onAddMovement={handleAddMovement} user={currentUser} />}
              {currentView === 'audit-reports' && <Reports products={products} movements={movements.filter(m => m.status === MovementStatus.APROBADO)} />}
              {currentView === 'export-audit' && <Reports products={products} movements={movements.filter(m => m.status === MovementStatus.APROBADO)} />}
            </>
          )}
        </main>
      </div>

      <ProductForm isOpen={isProductFormOpen}
        onClose={() => { setIsProductFormOpen(false); setEditingProduct(null); }}
        onSave={(data) =>
          editingProduct
            ? handleEditProduct(editingProduct.id, data)
            : handleAddProduct(data)
        }
        editProduct={editingProduct} />
    </div>
  );
}

export default App;