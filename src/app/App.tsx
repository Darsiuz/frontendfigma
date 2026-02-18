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

import { User } from '@/app/types/User';
import { Product } from '@/app/types/Product';
import { MovementStatus } from '@/app/types/Movement';
import { login } from '@/services/auth.service';

import { canAccessView } from '@/app/utils/sidebar.permissions';

import type { View } from '@/app/types/View';
import { toast } from "sonner";
import { useMovements } from './features/movements/useMovements';
import { useIncidents } from './features/incidents/useIncidents';
import { useProducts } from './features/products/userProducts';
import { useSystemConfig } from './features/system/useSystemConfig';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // esto es para manejar la carga antes de login
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { products, setProducts, handleAddProduct, handleEditProduct, handleDeleteProduct } = useProducts({ user: currentUser });
  const { movements, handleAddMovement, handleApproveMovement, handleRejectMovement } = useMovements({ user: currentUser, products, setProducts });
  const { incidents, handleAddIncident, handleResolveIncident } = useIncidents({ user: currentUser });
  const { systemConfig, handleSaveConfig, } = useSystemConfig({ user: currentUser });

  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");

    if (saved && token) {
      setCurrentUser(JSON.parse(saved));
      setIsLoggedIn(true);
    }
    setAuthLoading(false);
  }, []);

  // Cargar datos desde el servicio de base de datos
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;
  }, [isLoggedIn, currentUser]);

  // Redirigir al que no tiene acceso a la vista actual
  useEffect(() => {
    if (currentUser && !canAccessView(currentUser, currentView)) {
      setCurrentView(getDefaultViewByRole(currentUser));
    }
  }, [currentView, currentUser]);


  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login({ email, password });

      // GUARDAR JWT
      localStorage.setItem("token", response.token);

      const mappedUser: User = {
        email: response.email,
        name: response.name,
        role: response.role.toLowerCase() as User['role'],
      };

      localStorage.setItem("currentUser", JSON.stringify(mappedUser));

      setCurrentUser(mappedUser);
      setIsLoggedIn(true);
      setCurrentView(getDefaultViewByRole(mappedUser));

    } catch {
      toast.error('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentView('dashboard');
  };

  if (!isLoggedIn || !currentUser) {
    return <Login onLogin={handleLogin} />;
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