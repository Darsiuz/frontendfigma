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
import { User } from '@/app/types/User';
import * as DB from '@/services/database';

interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  location: string;
}

interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: 'entrada' | 'salida';
  quantity: number;
  date: string;
  reason: string;
  user: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  reviewedBy?: string;
  reviewedAt?: string;
}

interface Incident {
  id: string;
  productId: string;
  productName: string;
  type: 'daño' | 'pérdida' | 'robo' | 'vencimiento' | 'otro';
  quantity: number;
  description: string;
  status: 'pendiente' | 'resuelto' | 'rechazado';
  reportedBy: string;
  reportedAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

// interface User {
//   email: string;
//   role: 'admin' | 'manager' | 'operator' | 'auditor';
//   name: string;
// }

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'auditor';
  status: 'active' | 'inactive';
  createdAt: string;
}

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

type View = 'dashboard' | 'inventory' | 'users' | 'settings' | 'reports' | 
            'supervise' | 'approve' | 'incidents' | 'manager-reports' |
            'register-entry' | 'register-exit' | 'consult-inventory' | 'report-incident' |
            'audit-inventory' | 'audit-movements' | 'audit-reports' | 'export-audit';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DB.DEFAULT_CONFIG);
  
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Cargar datos desde el servicio de base de datos
  useEffect(() => {
    setProducts(DB.loadProducts());
    setMovements(DB.loadMovements());
    setIncidents(DB.loadIncidents());
    setAppUsers(DB.loadAppUsers());
    setSystemConfig(DB.loadSystemConfig());

    const savedUser = DB.loadCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser as User);
      setIsLoggedIn(true);
    }
  }, []);

  // Guardar datos automáticamente
  useEffect(() => { if (products.length > 0) DB.saveProducts(products); }, [products]);
  useEffect(() => { if (movements.length > 0) DB.saveMovements(movements); }, [movements]);
  useEffect(() => { if (incidents.length > 0) DB.saveIncidents(incidents); }, [incidents]);
  useEffect(() => { if (appUsers.length > 0) DB.saveAppUsers(appUsers); }, [appUsers]);
  useEffect(() => { DB.saveSystemConfig(systemConfig); }, [systemConfig]);

  const handleLogin = (email: string, password: string) => {
    const user = DB.authenticateUser(email, password);
    if (user) {
      const loggedUser = { email: user.email, role: user.role, name: user.name };
      setCurrentUser(loggedUser);
      setIsLoggedIn(true);
      DB.saveCurrentUser(loggedUser);
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentView('dashboard');
    DB.clearCurrentUser();
  };

  // Gestión de productos
  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...productData, id: Date.now().toString() };
    setProducts([...products, newProduct]);
  };

  const handleEditProduct = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p));
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Gestión de movimientos
  const handleAddMovement = (movementData: Omit<Movement, 'id' | 'date' | 'productName' | 'user' | 'status'>) => {
    const product = products.find(p => p.id === movementData.productId);
    if (!product || !currentUser) return;

    const newMovement: Movement = {
      ...movementData,
      id: Date.now().toString(),
      productName: product.name,
      date: new Date().toISOString(),
      user: currentUser.name,
      status: systemConfig.autoApproveMovements ? 'aprobado' : 'pendiente'
    };

    // Si está aprobado automáticamente, actualizar stock
    if (systemConfig.autoApproveMovements) {
      const updatedProducts = products.map(p => {
        if (p.id === movementData.productId) {
          const newQuantity = movementData.type === 'entrada'
            ? p.quantity + movementData.quantity
            : p.quantity - movementData.quantity;
          return { ...p, quantity: Math.max(0, newQuantity) };
        }
        return p;
      });
      setProducts(updatedProducts);
    }

    setMovements([...movements, newMovement]);
  };

  const handleApproveMovement = (id: string) => {
    const movement = movements.find(m => m.id === id);
    if (!movement || !currentUser) return;

    // Actualizar stock
    const updatedProducts = products.map(p => {
      if (p.id === movement.productId) {
        const newQuantity = movement.type === 'entrada'
          ? p.quantity + movement.quantity
          : p.quantity - movement.quantity;
        return { ...p, quantity: Math.max(0, newQuantity) };
      }
      return p;
    });

    setProducts(updatedProducts);
    setMovements(movements.map(m => 
      m.id === id 
        ? { ...m, status: 'aprobado', reviewedBy: currentUser.name, reviewedAt: new Date().toISOString() }
        : m
    ));
  };

  const handleRejectMovement = (id: string) => {
    if (!currentUser) return;
    setMovements(movements.map(m => 
      m.id === id 
        ? { ...m, status: 'rechazado', reviewedBy: currentUser.name, reviewedAt: new Date().toISOString() }
        : m
    ));
  };

  // Gestión de incidencias
  const handleAddIncident = (incidentData: Omit<Incident, 'id' | 'reportedAt' | 'reportedBy' | 'status'>) => {
    const product = products.find(p => p.id === incidentData.productId);
    if (!product || !currentUser) return;

    const newIncident: Incident = {
      ...incidentData,
      id: Date.now().toString(),
      productName: product.name,
      reportedBy: currentUser.name,
      reportedAt: new Date().toISOString(),
      status: 'pendiente'
    };

    setIncidents([...incidents, newIncident]);
  };

  const handleResolveIncident = (id: string, status: 'resuelto' | 'rechazado') => {
    const incident = incidents.find(i => i.id === id);
    if (!incident || !currentUser) return;

    // Si se resuelve, ajustar el stock
    if (status === 'resuelto') {
      const updatedProducts = products.map(p => {
        if (p.id === incident.productId) {
          return { ...p, quantity: Math.max(0, p.quantity - incident.quantity) };
        }
        return p;
      });
      setProducts(updatedProducts);
    }

    setIncidents(incidents.map(i => 
      i.id === id 
        ? { ...i, status, resolvedBy: currentUser.name, resolvedAt: new Date().toISOString() }
        : i
    ));
  };

  // Gestión de usuarios
  const handleAddAppUser = (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    const newUser: AppUser = { ...userData, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setAppUsers([...appUsers, newUser]);
  };

  const handleEditAppUser = (id: string, userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    setAppUsers(appUsers.map(u => u.id === id ? { ...userData, id, createdAt: u.createdAt } : u));
  };

  const handleDeleteAppUser = (id: string) => {
    setAppUsers(appUsers.filter(u => u.id !== id));
  };

  // Configuración del sistema
  const handleSaveConfig = (config: SystemConfig) => {
    setSystemConfig(config);
  };

  if (!isLoggedIn || !currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const getViewTitle = () => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard General',
      inventory: 'Gestionar Inventario',
      users: 'Gestionar Usuarios',
      settings: 'Configuración del Sistema',
      reports: 'Reportes Generales',
      supervise: 'Supervisar Inventario',
      approve: 'Aprobar Movimientos',
      incidents: 'Ajustar por Incidencias',
      'manager-reports': 'Reportes de Inventario',
      'register-entry': 'Registrar Entradas',
      'register-exit': 'Registrar Salidas',
      'consult-inventory': 'Consultar Inventario',
      'report-incident': 'Registrar Incidencias',
      'audit-inventory': 'Consultar Inventario',
      'audit-movements': 'Historial de Movimientos',
      'audit-reports': 'Generar Reportes',
      'export-audit': 'Exportar para Auditoría'
    };
    return titles[currentView] || 'Dashboard';
  };

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
              <h1 className="text-2xl font-bold text-gray-900">{getViewTitle()}</h1>
              <p className="text-sm text-gray-600 mt-1">Bienvenido, {currentUser.name}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {currentView === 'dashboard' && <DashboardView products={products} movements={movements.filter(m => m.status === 'aprobado')} />}
          
          {/* Admin */}
          {currentView === 'inventory' && <InventoryManagement products={products} onEdit={(p) => { setEditingProduct(p); setIsProductFormOpen(true); }} onDelete={handleDeleteProduct} onAdd={() => { setEditingProduct(null); setIsProductFormOpen(true); }} user={currentUser} />}
          {currentView === 'users' && <UserManagement users={appUsers} onAddUser={handleAddAppUser} onEditUser={handleEditAppUser} onDeleteUser={handleDeleteAppUser} />}
          {currentView === 'settings' && <SystemSettings config={systemConfig} onSave={handleSaveConfig} />}
          {currentView === 'reports' && <Reports products={products} movements={movements.filter(m => m.status === 'aprobado')} />}
          
          {/* Manager */}
          {currentView === 'supervise' && <InventoryManagement products={products} onEdit={(p) => { setEditingProduct(p); setIsProductFormOpen(true); }} onDelete={handleDeleteProduct} onAdd={() => { setEditingProduct(null); setIsProductFormOpen(true); }} user={currentUser} />}
          {currentView === 'approve' && <ApproveMovements movements={movements} onApprove={handleApproveMovement} onReject={handleRejectMovement} />}
          {currentView === 'incidents' && <IncidentManagement products={products} incidents={incidents} onAddIncident={handleAddIncident} onResolveIncident={handleResolveIncident} user={currentUser} />}
          {currentView === 'manager-reports' && <Reports products={products} movements={movements.filter(m => m.status === 'aprobado')} />}
          
          {/* Operator */}
          {currentView === 'register-entry' && <StockMovements products={products} movements={movements} onAddMovement={handleAddMovement} user={currentUser} />}
          {currentView === 'register-exit' && <StockMovements products={products} movements={movements} onAddMovement={handleAddMovement} user={currentUser} />}
          {currentView === 'consult-inventory' && <InventoryManagement products={products} onEdit={(p) => {}} onDelete={() => {}} onAdd={() => {}} user={currentUser} />}
          {currentView === 'report-incident' && <IncidentManagement products={products} incidents={incidents} onAddIncident={handleAddIncident} onResolveIncident={handleResolveIncident} user={currentUser} />}
          
          {/* Auditor */}
          {currentView === 'audit-inventory' && <InventoryManagement products={products} onEdit={(p) => {}} onDelete={() => {}} onAdd={() => {}} user={currentUser} />}
          {currentView === 'audit-movements' && <StockMovements products={products} movements={movements.filter(m => m.status === 'aprobado')} onAddMovement={handleAddMovement} user={currentUser} />}
          {currentView === 'audit-reports' && <Reports products={products} movements={movements.filter(m => m.status === 'aprobado')} />}
          {currentView === 'export-audit' && <Reports products={products} movements={movements.filter(m => m.status === 'aprobado')} />}
        </main>
      </div>

      <ProductForm isOpen={isProductFormOpen} onClose={() => { setIsProductFormOpen(false); setEditingProduct(null); }} onSave={editingProduct ? handleEditProduct : handleAddProduct} editProduct={editingProduct} />
    </div>
  );
}

export default App;