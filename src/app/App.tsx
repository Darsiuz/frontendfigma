import { useState, useEffect } from 'react';
import { Login } from '@components/Login';
import { Sidebar } from '@components/Sidebar';
import { DashboardView } from '@components/DashboardView';
import { InventoryManagement } from '@components/InventoryManagement';
import { StockMovements } from '@components/StockMovements';
import { UserManagement } from '@components/UserManagement';
import { Reports } from '@components/Reports';
import { ProductForm } from '@components/ProductForm';
import { SystemSettings } from '@components/SystemSettings';
import { IncidentManagement } from '@components/IncidentManagement';
import { ApproveMovements } from '@components/ApproveMovements';
import { getDefaultViewByRole } from '@utils/defaultViewByRole';
import { getViewLabel } from '@utils/views.config';
import { canAccessView } from '@utils/sidebar.permissions';
import type { Product } from '@type/Product';
import type { View } from '@type/View';
import { useMovements } from '@features/movements/useMovements';
import { useIncidents } from '@features/incidents/useIncidents';
import { useProducts } from '@features/products/useProducts';
import { useSystemConfig } from '@features/system/useSystemConfig';
import { useAuth } from "@features/auth/useAuth";
import { AppProvider } from '@context/AppContext';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@components/ui/resizable";

function App() {
  const { isLoggedIn, currentUser, authLoading, handleLogin, handleLogout, } = useAuth();

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { products, setProducts, handleAddProduct, handleEditProduct, handleDeleteProduct, formErrors, setFormErrors } = useProducts({ user: currentUser });
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
    <AppProvider value={{
      currentUser,
      products,
      movements,
      incidents,
      systemConfig
    }}>
      <div className="flex h-screen bg-gray-100">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
                {currentView === 'dashboard' && <DashboardView />}

                {/* Admin */}
                {currentView === 'inventory' && <InventoryManagement onEdit={(p) => { setEditingProduct(p); setIsProductFormOpen(true); }} onDelete={handleDeleteProduct} onAdd={() => { setEditingProduct(null); setIsProductFormOpen(true); }} />}
                {currentView === 'users' && <UserManagement />}
                {currentView === 'reports' && <Reports />}
                {currentView === 'settings' && systemConfig && (<SystemSettings onSave={handleSaveConfig} />)}

                {/* Manager */}
                {currentView === 'supervise' && <InventoryManagement onEdit={(p) => { setEditingProduct(p); setIsProductFormOpen(true); }} onDelete={handleDeleteProduct} onAdd={() => { setEditingProduct(null); setIsProductFormOpen(true); }} />}
                {currentView === 'approve' && <ApproveMovements onApprove={handleApproveMovement} onReject={handleRejectMovement} />}
                {currentView === 'incidents' && <IncidentManagement onAddIncident={handleAddIncident} onResolveIncident={handleResolveIncident} />}
                {currentView === 'manager-reports' && <Reports />}

                {/* Operator */}
                {currentView === 'register-movements' && <StockMovements onAddMovement={handleAddMovement} />}
                {currentView === 'consult-inventory' && <InventoryManagement onEdit={(p) => { }} onDelete={() => { }} onAdd={() => { }} />}
                {currentView === 'report-incident' && <IncidentManagement onAddIncident={handleAddIncident} onResolveIncident={handleResolveIncident} />}

                {/* Auditor */}
                {currentView === 'audit-inventory' && <InventoryManagement onEdit={(p) => { }} onDelete={() => { }} onAdd={() => { }} />}
                {currentView === 'audit-movements' && <StockMovements onAddMovement={handleAddMovement} />}
                {currentView === 'audit-reports' && <Reports />}
              </>
            )}
          </main>

        </div>

        <ProductForm isOpen={isProductFormOpen}
          onClose={() => { setIsProductFormOpen(false); setEditingProduct(null); setFormErrors({}); }}
          onSave={(data) => editingProduct
            ? handleEditProduct(editingProduct.id, data)
            : handleAddProduct(data)
          }
          editProduct={editingProduct}
          formErrors={formErrors}
        />
      </div>
    </AppProvider>
  );
}

export default App;