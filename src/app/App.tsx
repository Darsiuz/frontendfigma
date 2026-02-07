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
import { Movement } from '@/app/types/Movement';
import { Incident } from '@/app/types/Incident';
import { login } from '@/services/auth.service';
import * as ProductService from '@/services/product.service';
import * as MovementService from '@/services/movement.service';
import * as IncidentService from '@/services/incident.service';
import * as SystemConfigService from '@/services/systemConfig.service';

import { canAccessView } from '@/app/utils/sidebar.permissions';

import type { View } from '@/app/types/View';
interface SystemConfig {
  companyName: string;
  lowStockThreshold: number;
  currency: string;
  autoApproveMovements: boolean;
  requireIncidentApproval: boolean;
  enableNotifications: boolean;
  defaultLocation: string;
  maxStockPerProduct: number;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // esto es para manejar la carga antes de login
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  // const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);

  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Cargar datos desde el servicio de base de datos
  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
      setIsLoggedIn(true);
    }
    setAuthLoading(false);

    ProductService.getProducts()
      .then(setProducts)
      .catch(() => alert('Error cargando productos'));

    MovementService.getMovements()
      .then(setMovements)
      .catch(() => alert('Error cargando movimientos'));

    IncidentService.getIncidents()
      .then(setIncidents)
      .catch(() => alert('Error cargando incidencias'));

    SystemConfigService.getSystemConfig()
      .then(setSystemConfig)
      .catch(() => alert('Error cargando configuracion del sistema'));
  }, []);

  // Redirigir al que no tiene acceso a la vista actual
  useEffect(() => {
    if (currentUser && !canAccessView(currentUser, currentView)) {
      setCurrentView(getDefaultViewByRole(currentUser));
    }
  }, [currentView, currentUser]);


  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login({ email, password });

      localStorage.setItem("auth", `${email}:${password}`);

      const mappedUser: User = {
        email: response.email,
        name: response.name,
        role: response.role.toLowerCase() as User['role'],
      };

      setCurrentUser(mappedUser);
      setIsLoggedIn(true);

      setCurrentView(getDefaultViewByRole(mappedUser));

    } catch (error) {
      alert("Credenciales incorrectas");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentView('dashboard');
    localStorage.removeItem('currentUser');
  };

  // Gestión de productos
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await ProductService.createProduct(productData);
      setProducts([...products, newProduct]);
    } catch {
      alert('Error creando producto');
    }
  };

  const handleEditProduct = async (productData: Omit<Product, 'id'>) => {
    if (!editingProduct) return;

    try {
      const updated = await ProductService.updateProduct(
        editingProduct.id,
        productData
      );

      setProducts(products.map(p => (p.id === updated.id ? updated : p)));
      setEditingProduct(null);
    } catch {
      alert('Error actualizando producto');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await ProductService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch {
      alert('Error eliminando producto');
    }
  };

  // Gestión de movimientos
  const handleAddMovement = async (
    movementData: Omit<Movement, 'id' | 'date' | 'productName' | 'user' | 'status'>
  ) => {
    try {
      const newMovement = await MovementService.createMovement(movementData);
      setMovements([...movements, newMovement]);
    } catch {
      alert('Error registrando movimiento');
    }
  };

  const handleApproveMovement = async (id: string) => {
    try {
      const updated = await MovementService.approveMovement(id);
      setMovements(movements.map(m => (m.id === id ? updated : m)));
    } catch {
      alert('Error aprobando movimiento');
    }
  };

  const handleRejectMovement = async (id: string) => {
    try {
      const updated = await MovementService.rejectMovement(id);
      setMovements(movements.map(m => (m.id === id ? updated : m)));
    } catch {
      alert('Error rechazando movimiento');
    }
  };

  // Gestión de incidencias
  const handleAddIncident = async (incidentData: Omit<Incident, 'id' | 'productName' | 'reportedAt' | 'reportedBy' | 'status'>) => {
    try {
      const newIncident = await IncidentService.createIncident(incidentData);
      setIncidents([...incidents, newIncident]);
    } catch {
      alert('Error registrando incidencia');
    }
  };

  const handleResolveIncident = async (id: string, status: 'resuelto' | 'rechazado') => {
    try {
      const updated =
        status === 'resuelto'
          ? await IncidentService.resolveIncident(id)
          : await IncidentService.rejectIncident(id);

      setIncidents(incidents.map(i => (i.id === id ? updated : i)));
    } catch {
      alert('Error actualizando incidencia');
    }
  };

  // Gestión de usuarios
  // const handleAddAppUser = (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
  //   const newUser: AppUser = { ...userData, id: Date.now().toString(), createdAt: new Date().toISOString() };
  //   setAppUsers([...appUsers, newUser]);
  // };

  // const handleEditAppUser = (id: string, userData: Omit<AppUser, 'id' | 'createdAt'>) => {
  //   setAppUsers(appUsers.map(u => u.id === id ? { ...userData, id, createdAt: u.createdAt } : u));
  // };

  // const handleDeleteAppUser = (id: number) => {
  //   setAppUsers(appUsers.filter(u => u.id !== id));
  // };

  // Configuración del sistema
  const handleSaveConfig = async (config: SystemConfig) => {
    try {
      const updated = await SystemConfigService.updateSystemConfig(config);
      setSystemConfig(updated);
      alert('Configuracion guardada correctamente');
    } catch {
      alert('Error guardando configuracion');
    }
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
              {currentView === 'dashboard' && <DashboardView products={products} movements={movements.filter(m => m.status === 'aprobado')} />}

              {/* Admin */}
              {currentView === 'inventory' && <InventoryManagement products={products} onEdit={(p) => { setEditingProduct(p); setIsProductFormOpen(true); }} onDelete={handleDeleteProduct} onAdd={() => { setEditingProduct(null); setIsProductFormOpen(true); }} user={currentUser} />}
              {currentView === 'users' && <UserManagement />}
              {currentView === 'settings' && systemConfig && (<SystemSettings config={systemConfig} onSave={handleSaveConfig} />)}
              {currentView === 'reports' && <Reports products={products} movements={movements.filter(m => m.status === 'aprobado')} />}

              {/* Manager */}
              {currentView === 'supervise' && <InventoryManagement products={products} onEdit={(p) => { setEditingProduct(p); setIsProductFormOpen(true); }} onDelete={handleDeleteProduct} onAdd={() => { setEditingProduct(null); setIsProductFormOpen(true); }} user={currentUser} />}
              {currentView === 'approve' && <ApproveMovements movements={movements} onApprove={handleApproveMovement} onReject={handleRejectMovement} />}
              {currentView === 'incidents' && <IncidentManagement products={products} incidents={incidents} onAddIncident={handleAddIncident} onResolveIncident={handleResolveIncident} user={currentUser} />}
              {currentView === 'manager-reports' && <Reports products={products} movements={movements.filter(m => m.status === 'aprobado')} />}

              {/* Operator */}
              {currentView === 'register-entry' && <StockMovements products={products} movements={movements} onAddMovement={handleAddMovement} user={currentUser} />}
              {currentView === 'register-exit' && <StockMovements products={products} movements={movements} onAddMovement={handleAddMovement} user={currentUser} />}
              {currentView === 'consult-inventory' && <InventoryManagement products={products} onEdit={(p) => { }} onDelete={() => { }} onAdd={() => { }} user={currentUser} />}
              {currentView === 'report-incident' && <IncidentManagement products={products} incidents={incidents} onAddIncident={handleAddIncident} onResolveIncident={handleResolveIncident} user={currentUser} />}

              {/* Auditor */}
              {currentView === 'audit-inventory' && <InventoryManagement products={products} onEdit={(p) => { }} onDelete={() => { }} onAdd={() => { }} user={currentUser} />}
              {currentView === 'audit-movements' && <StockMovements products={products} movements={movements.filter(m => m.status === 'aprobado')} onAddMovement={handleAddMovement} user={currentUser} />}
              {currentView === 'audit-reports' && <Reports products={products} movements={movements.filter(m => m.status === 'aprobado')} />}
              {currentView === 'export-audit' && <Reports products={products} movements={movements.filter(m => m.status === 'aprobado')} />}
            </>
          )}
        </main>
      </div>

      <ProductForm isOpen={isProductFormOpen} onClose={() => { setIsProductFormOpen(false); setEditingProduct(null); }} onSave={editingProduct ? handleEditProduct : handleAddProduct} editProduct={editingProduct} />
    </div>
  );
}

export default App;