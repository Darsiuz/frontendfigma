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
import { Movement, MovementStatus, MovementType } from '@/app/types/Movement';
import { Incident } from '@/app/types/Incident';
import { SystemConfig } from '@/app/types/SystemConfig';
import { login } from '@/services/auth.service';
import * as ProductService from '@/services/product.service';
import * as MovementService from '@/services/movement.service';
import * as IncidentService from '@/services/incident.service';
import * as SystemConfigService from '@/services/systemConfig.service';

import { canAccessView } from '@/app/utils/sidebar.permissions';

import type { View } from '@/app/types/View';
import { canViewIncidents, canViewMovements, canViewProduct, canViewSystemSettings } from './utils/permissions';
import { toast } from "sonner";

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

    // Productos
    if (canViewProduct(currentUser)) {

      ProductService.getProducts()
        .then(setProducts)
        .catch(() => console.warn('Productos no cargados'));
    }

    // Movimientos
    if (canViewMovements(currentUser)) {

      MovementService.getMovements()
        .then(setMovements)
        .catch(() => console.warn('Movimientos no cargados'));
    }

    // Incidencias
    if (canViewIncidents(currentUser)) {

      IncidentService.getIncidents()
        .then(setIncidents)
        .catch(() => console.warn('Incidencias no cargadas'));
    }

    // SystemConfig SOLO ADMIN
    if (canViewSystemSettings(currentUser)) {
      SystemConfigService.getSystemConfig()
        .then(setSystemConfig)
        .catch(() => console.warn('SystemConfig no cargado'));
    }

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

  // Gestión de productos
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await ProductService.createProduct(productData);
      setProducts([...products, newProduct]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error creando producto');
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
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error actualizando producto');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await ProductService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error eliminando producto');
    }
  };

  // Gestión de movimientos
  const handleAddMovement = async (
    movementData: Omit<Movement, 'id' | 'date' | 'productName' | 'user' | 'status'>
  ) => {
    const promise = MovementService.createMovement(movementData);

    toast.promise(promise, {
      loading: "Registrando movimiento...",
      success: "Movimiento registrado correctamente",
      error: (err) =>
        err?.response?.data?.message || "Error registrando movimiento",
    });

    try {
      const newMovement: Movement = await promise;

      setMovements(prev => [...prev, newMovement]);

      if (newMovement.status === MovementStatus.APROBADO) {
        setProducts(prev =>
          prev.map(p =>
            p.id === newMovement.productId
              ? {
                ...p,
                quantity:
                  newMovement.type === MovementType.ENTRADA
                    ? p.quantity + newMovement.quantity
                    : p.quantity - newMovement.quantity,
              }
              : p
          )
        );
      }

    } catch (error: any) { }
  };

  const handleApproveMovement = async (id: string) => {
    try {
      const updated = await MovementService.approveMovement(id);
      setMovements(movements.map(m => (m.id === id ? updated : m)));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error aprobando movimiento');
    }
  };

  const handleRejectMovement = async (id: string) => {
    try {
      const updated = await MovementService.rejectMovement(id);
      setMovements(movements.map(m => (m.id === id ? updated : m)));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error rechazando movimiento');
    }
  };

  // Gestión de incidencias
  const handleAddIncident = async (incidentData: Omit<Incident, 'id' | 'productName' | 'reportedAt' | 'reportedBy' | 'status'>) => {
    try {
      const newIncident = await IncidentService.createIncident(incidentData);
      setIncidents([...incidents, newIncident]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error registrando incidencia');
    }
  };

  const handleResolveIncident = async (id: string, status: 'resuelto' | 'rechazado') => {
    try {
      const updated =
        status === 'resuelto'
          ? await IncidentService.resolveIncident(id)
          : await IncidentService.rejectIncident(id);

      setIncidents(incidents.map(i => (i.id === id ? updated : i)));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error actualizando incidencia');
    }
  };

  // Configuración del sistema
  const handleSaveConfig = async (config: SystemConfig) => {
    try {
      const updated = await SystemConfigService.updateSystemConfig(config);
      setSystemConfig(updated);
      toast.success('Configuracion guardada correctamente');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error guardando configuracion');
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
              {currentView === 'dashboard' && <DashboardView products={products} movements={movements.filter(m => m.status === MovementStatus.APROBADO)} />}

              {/* Admin */}
              {currentView === 'inventory' && <InventoryManagement products={products} onEdit={(p) => { setEditingProduct(p); setIsProductFormOpen(true); }} onDelete={handleDeleteProduct} onAdd={() => { setEditingProduct(null); setIsProductFormOpen(true); }} user={currentUser} />}
              {currentView === 'users' && <UserManagement />}
              {currentView === 'settings' && systemConfig && (<SystemSettings config={systemConfig} onSave={handleSaveConfig} />)}
              {currentView === 'reports' && <Reports products={products} movements={movements.filter(m => m.status === MovementStatus.APROBADO)} />}

              {/* Manager */}
              {currentView === 'supervise' && <InventoryManagement products={products} onEdit={(p) => { setEditingProduct(p); setIsProductFormOpen(true); }} onDelete={handleDeleteProduct} onAdd={() => { setEditingProduct(null); setIsProductFormOpen(true); }} user={currentUser} />}
              {currentView === 'approve' && <ApproveMovements movements={movements} onApprove={handleApproveMovement} onReject={handleRejectMovement} />}
              {currentView === 'incidents' && <IncidentManagement products={products} incidents={incidents} onAddIncident={handleAddIncident} onResolveIncident={handleResolveIncident} user={currentUser} />}
              {currentView === 'manager-reports' && <Reports products={products} movements={movements.filter(m => m.status === MovementStatus.APROBADO)} />}

              {/* Operator */}
              {currentView === 'register-entry' && <StockMovements products={products} movements={movements} onAddMovement={handleAddMovement} user={currentUser} />}
              {currentView === 'register-exit' && <StockMovements products={products} movements={movements} onAddMovement={handleAddMovement} user={currentUser} />}
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

      <ProductForm isOpen={isProductFormOpen} onClose={() => { setIsProductFormOpen(false); setEditingProduct(null); }} onSave={editingProduct ? handleEditProduct : handleAddProduct} editProduct={editingProduct} />
    </div>
  );
}

export default App;