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
import { View } from '@/app/types/View';

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

interface User {
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'auditor';
  name: string;
}

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

// type View = 'dashboard' | 'inventory' | 'users' | 'settings' | 'reports' | 
//             'supervise' | 'approve' | 'incidents' | 'manager-reports' |
//             'register-entry' | 'register-exit' | 'consult-inventory' | 'report-incident' |
//             'audit-inventory' | 'audit-movements' | 'audit-reports' | 'export-audit';

// Usuarios del sistema
const systemUsers = [
  { email: 'admin@warehouse.com', password: 'admin123', role: 'admin' as const, name: 'Admin Principal' },
  { email: 'manager@warehouse.com', password: 'manager123', role: 'manager' as const, name: 'Manager López' },
  { email: 'operator@warehouse.com', password: 'operator123', role: 'operator' as const, name: 'Operador García' },
  { email: 'auditor@warehouse.com', password: 'auditor123', role: 'auditor' as const, name: 'Auditor Martínez' },
];

// Datos iniciales
const initialProducts: Product[] = [
  { id: '1', name: 'Laptop HP Pavilion 15', category: 'Electrónica', quantity: 15, minStock: 5, price: 899.99, location: 'Pasillo A, Estante 1' },
  { id: '2', name: 'Mouse Logitech MX Master', category: 'Accesorios', quantity: 45, minStock: 20, price: 79.99, location: 'Pasillo B, Estante 3' },
  { id: '3', name: 'Teclado Mecánico RGB', category: 'Accesorios', quantity: 3, minStock: 10, price: 149.99, location: 'Pasillo B, Estante 2' },
  { id: '4', name: 'Monitor Dell 27"', category: 'Electrónica', quantity: 8, minStock: 5, price: 329.99, location: 'Pasillo A, Estante 2' },
  { id: '5', name: 'Silla Ergonómica', category: 'Mobiliario', quantity: 12, minStock: 5, price: 299.99, location: 'Bodega Principal' },
  { id: '6', name: 'Impresora Multifuncional', category: 'Electrónica', quantity: 6, minStock: 3, price: 249.99, location: 'Pasillo C, Estante 1' },
  { id: '7', name: 'Webcam HD 1080p', category: 'Accesorios', quantity: 25, minStock: 10, price: 59.99, location: 'Pasillo B, Estante 1' },
  { id: '8', name: 'Escritorio Ajustable', category: 'Mobiliario', quantity: 4, minStock: 5, price: 449.99, location: 'Bodega Principal' }
];

const initialAppUsers: AppUser[] = [
  { id: '1', name: 'Admin Principal', email: 'admin@warehouse.com', role: 'admin', status: 'active', createdAt: new Date(2025, 0, 1).toISOString() },
  { id: '2', name: 'Manager López', email: 'manager@warehouse.com', role: 'manager', status: 'active', createdAt: new Date(2025, 1, 15).toISOString() },
  { id: '3', name: 'Operador García', email: 'operator@warehouse.com', role: 'operator', status: 'active', createdAt: new Date(2025, 2, 10).toISOString() },
  { id: '4', name: 'Auditor Martínez', email: 'auditor@warehouse.com', role: 'auditor', status: 'active', createdAt: new Date(2025, 3, 5).toISOString() },
  { id: '5', name: 'María González', email: 'maria.gonzalez@warehouse.com', role: 'operator', status: 'active', createdAt: new Date(2025, 5, 20).toISOString() }
];

const defaultConfig: SystemConfig = {
  companyName: 'Almacén Central',
  lowStockThreshold: 20,
  currency: 'USD',
  autoApproveMovements: false,
  requireIncidentApproval: true,
  enableNotifications: true,
  defaultLocation: 'Almacén Principal',
  maxStockPerProduct: 1000
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(defaultConfig);
  
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Cargar datos
  useEffect(() => {
    const savedProducts = localStorage.getItem('warehouse_products');
    const savedMovements = localStorage.getItem('warehouse_movements');
    const savedIncidents = localStorage.getItem('warehouse_incidents');
    const savedAppUsers = localStorage.getItem('warehouse_app_users');
    const savedConfig = localStorage.getItem('warehouse_config');
    const savedUser = localStorage.getItem('warehouse_current_user');

    setProducts(savedProducts ? JSON.parse(savedProducts) : initialProducts);
    setMovements(savedMovements ? JSON.parse(savedMovements) : []);
    setIncidents(savedIncidents ? JSON.parse(savedIncidents) : []);
    setAppUsers(savedAppUsers ? JSON.parse(savedAppUsers) : initialAppUsers);
    setSystemConfig(savedConfig ? JSON.parse(savedConfig) : defaultConfig);

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  }, []);

  // Guardar datos
  useEffect(() => { if (products.length > 0) localStorage.setItem('warehouse_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { if (movements.length > 0) localStorage.setItem('warehouse_movements', JSON.stringify(movements)); }, [movements]);
  useEffect(() => { if (incidents.length > 0) localStorage.setItem('warehouse_incidents', JSON.stringify(incidents)); }, [incidents]);
  useEffect(() => { if (appUsers.length > 0) localStorage.setItem('warehouse_app_users', JSON.stringify(appUsers)); }, [appUsers]);
  useEffect(() => { localStorage.setItem('warehouse_config', JSON.stringify(systemConfig)); }, [systemConfig]);

  const handleLogin = (email: string, password: string) => {
    const user = systemUsers.find(u => u.email === email && u.password === password);
    if (user) {
      const loggedUser = { email: user.email, role: user.role, name: user.name };
      setCurrentUser(loggedUser);
      setIsLoggedIn(true);
      localStorage.setItem('warehouse_current_user', JSON.stringify(loggedUser));
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentView('dashboard');
    localStorage.removeItem('warehouse_current_user');
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
  const handleAddIncident = (incidentData: Omit<Incident, 'id' | 'reportedAt' | 'reportedBy' | 'status' | 'productName'>) => {
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
          {currentView === 'register-entry' && <StockMovements products={products} movements={movements.filter(m => m.status === 'aprobado')} onAddMovement={handleAddMovement} user={currentUser} />}
          {currentView === 'register-exit' && <StockMovements products={products} movements={movements.filter(m => m.status === 'aprobado')} onAddMovement={handleAddMovement} user={currentUser} />}
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
