import { useState, useEffect } from 'react';
import { Login } from '@/app/components/Login';
import { Sidebar } from '@/app/components/Sidebar';
import { DashboardView } from '@/app/components/DashboardView';
import { InventoryManagement } from '@/app/components/InventoryManagement';
import { StockMovements } from '@/app/components/StockMovements';
import { UserManagement } from '@/app/components/UserManagement';
import { Reports } from '@/app/components/Reports';
import { ProductForm } from '@/app/components/ProductForm';

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
}

interface User {
  email: string;
  role: 'admin' | 'manager' | 'operator';
  name: string;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  status: 'active' | 'inactive';
  createdAt: string;
}

type View = 'dashboard' | 'inventory' | 'movements' | 'users' | 'reports';

// Usuarios del sistema
const systemUsers = [
  { email: 'admin@warehouse.com', password: 'admin123', role: 'admin' as const, name: 'Admin Principal' },
  { email: 'manager@warehouse.com', password: 'manager123', role: 'manager' as const, name: 'Gerente López' },
  { email: 'operator@warehouse.com', password: 'operator123', role: 'operator' as const, name: 'Operador García' },
];

// Datos iniciales de productos
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Laptop HP Pavilion 15',
    category: 'Electrónica',
    quantity: 15,
    minStock: 5,
    price: 899.99,
    location: 'Pasillo A, Estante 1'
  },
  {
    id: '2',
    name: 'Mouse Logitech MX Master',
    category: 'Accesorios',
    quantity: 45,
    minStock: 20,
    price: 79.99,
    location: 'Pasillo B, Estante 3'
  },
  {
    id: '3',
    name: 'Teclado Mecánico RGB',
    category: 'Accesorios',
    quantity: 3,
    minStock: 10,
    price: 149.99,
    location: 'Pasillo B, Estante 2'
  },
  {
    id: '4',
    name: 'Monitor Dell UltraSharp 27"',
    category: 'Electrónica',
    quantity: 8,
    minStock: 5,
    price: 329.99,
    location: 'Pasillo A, Estante 2'
  },
  {
    id: '5',
    name: 'Silla Ergonómica Executive',
    category: 'Mobiliario',
    quantity: 12,
    minStock: 5,
    price: 299.99,
    location: 'Bodega Principal'
  },
  {
    id: '6',
    name: 'Impresora Multifuncional',
    category: 'Electrónica',
    quantity: 6,
    minStock: 3,
    price: 249.99,
    location: 'Pasillo C, Estante 1'
  },
  {
    id: '7',
    name: 'Webcam HD 1080p',
    category: 'Accesorios',
    quantity: 25,
    minStock: 10,
    price: 59.99,
    location: 'Pasillo B, Estante 1'
  },
  {
    id: '8',
    name: 'Escritorio Ajustable',
    category: 'Mobiliario',
    quantity: 4,
    minStock: 5,
    price: 449.99,
    location: 'Bodega Principal'
  }
];

// Movimientos iniciales
const initialMovements: Movement[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Laptop HP Pavilion 15',
    type: 'entrada',
    quantity: 10,
    date: new Date(2026, 0, 5).toISOString(),
    reason: 'Compra a proveedor principal',
    user: 'Admin Principal'
  },
  {
    id: '2',
    productId: '2',
    productName: 'Mouse Logitech MX Master',
    type: 'salida',
    quantity: 15,
    date: new Date(2026, 0, 8).toISOString(),
    reason: 'Venta corporativa - Empresa XYZ',
    user: 'Gerente López'
  },
  {
    id: '3',
    productId: '3',
    productName: 'Teclado Mecánico RGB',
    type: 'salida',
    quantity: 7,
    date: new Date(2026, 0, 10).toISOString(),
    reason: 'Pedido online - Cliente Premium',
    user: 'Operador García'
  },
  {
    id: '4',
    productId: '4',
    productName: 'Monitor Dell UltraSharp 27"',
    type: 'entrada',
    quantity: 5,
    date: new Date(2026, 0, 11).toISOString(),
    reason: 'Reposición de stock',
    user: 'Gerente López'
  },
  {
    id: '5',
    productId: '7',
    productName: 'Webcam HD 1080p',
    type: 'entrada',
    quantity: 20,
    date: new Date(2026, 0, 12).toISOString(),
    reason: 'Nueva adquisición',
    user: 'Admin Principal'
  }
];

// Usuarios de la aplicación
const initialAppUsers: AppUser[] = [
  {
    id: '1',
    name: 'Admin Principal',
    email: 'admin@warehouse.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date(2025, 0, 1).toISOString()
  },
  {
    id: '2',
    name: 'Gerente López',
    email: 'manager@warehouse.com',
    role: 'manager',
    status: 'active',
    createdAt: new Date(2025, 1, 15).toISOString()
  },
  {
    id: '3',
    name: 'Operador García',
    email: 'operator@warehouse.com',
    role: 'operator',
    status: 'active',
    createdAt: new Date(2025, 2, 10).toISOString()
  },
  {
    id: '4',
    name: 'María González',
    email: 'maria.gonzalez@warehouse.com',
    role: 'operator',
    status: 'active',
    createdAt: new Date(2025, 5, 20).toISOString()
  }
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Cargar datos desde localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('warehouse_products');
    const savedMovements = localStorage.getItem('warehouse_movements');
    const savedAppUsers = localStorage.getItem('warehouse_app_users');
    const savedUser = localStorage.getItem('warehouse_current_user');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(initialProducts);
    }

    if (savedMovements) {
      setMovements(JSON.parse(savedMovements));
    } else {
      setMovements(initialMovements);
    }

    if (savedAppUsers) {
      setAppUsers(JSON.parse(savedAppUsers));
    } else {
      setAppUsers(initialAppUsers);
    }

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  }, []);

  // Guardar datos en localStorage
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('warehouse_products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (movements.length > 0) {
      localStorage.setItem('warehouse_movements', JSON.stringify(movements));
    }
  }, [movements]);

  useEffect(() => {
    if (appUsers.length > 0) {
      localStorage.setItem('warehouse_app_users', JSON.stringify(appUsers));
    }
  }, [appUsers]);

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
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
    };
    setProducts([...products, newProduct]);
  };

  const handleEditProduct = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...productData, id: editingProduct.id }
          : p
      ));
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const openEditProductForm = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const closeProductForm = () => {
    setIsProductFormOpen(false);
    setEditingProduct(null);
  };

  // Gestión de movimientos
  const handleAddMovement = (movementData: Omit<Movement, 'id' | 'date' | 'productName' | 'user'>) => {
    const product = products.find(p => p.id === movementData.productId);
    if (!product || !currentUser) return;

    const newMovement: Movement = {
      ...movementData,
      id: Date.now().toString(),
      productName: product.name,
      date: new Date().toISOString(),
      user: currentUser.name,
    };

    // Actualizar cantidad del producto
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
    setMovements([...movements, newMovement]);
  };

  // Gestión de usuarios de la aplicación
  const handleAddAppUser = (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    const newUser: AppUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setAppUsers([...appUsers, newUser]);
  };

  const handleEditAppUser = (id: string, userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    setAppUsers(appUsers.map(u => 
      u.id === id 
        ? { ...userData, id, createdAt: u.createdAt }
        : u
    ));
  };

  const handleDeleteAppUser = (id: string) => {
    setAppUsers(appUsers.filter(u => u.id !== id));
  };

  if (!isLoggedIn || !currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={currentUser}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentView === 'dashboard' && 'Dashboard General'}
                {currentView === 'inventory' && 'Gestión de Inventario'}
                {currentView === 'movements' && 'Movimientos de Stock'}
                {currentView === 'users' && 'Gestión de Usuarios'}
                {currentView === 'reports' && 'Reportes'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Bienvenido, {currentUser.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">
                  {currentUser.role === 'admin' && 'Administrador'}
                  {currentUser.role === 'manager' && 'Gerente'}
                  {currentUser.role === 'operator' && 'Operador'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {currentView === 'dashboard' && (
            <DashboardView products={products} movements={movements} />
          )}

          {currentView === 'inventory' && (
            <InventoryManagement
              products={products}
              onEdit={openEditProductForm}
              onDelete={handleDeleteProduct}
              onAdd={() => {
                setEditingProduct(null);
                setIsProductFormOpen(true);
              }}
              user={currentUser}
            />
          )}

          {currentView === 'movements' && (
            <StockMovements
              products={products}
              movements={movements}
              onAddMovement={handleAddMovement}
              user={currentUser}
            />
          )}

          {currentView === 'users' && currentUser.role === 'admin' && (
            <UserManagement
              users={appUsers}
              onAddUser={handleAddAppUser}
              onEditUser={handleEditAppUser}
              onDeleteUser={handleDeleteAppUser}
            />
          )}

          {currentView === 'reports' && (currentUser.role === 'admin' || currentUser.role === 'manager') && (
            <Reports products={products} movements={movements} />
          )}
        </main>
      </div>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isProductFormOpen}
        onClose={closeProductForm}
        onSave={editingProduct ? handleEditProduct : handleAddProduct}
        editProduct={editingProduct}
      />
    </div>
  );
}

export default App;
