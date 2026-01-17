/**
 * SERVICIO DE BASE DE DATOS SIMULADA
 */

// TIPOS DE DATOS
export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  location: string;
}

export interface Movement {
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

export interface Incident {
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

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'auditor';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface SystemUser {
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'operator' | 'auditor';
  name: string;
}

export interface SystemConfig {
  companyName: string;
  lowStockThreshold: number;
  currency: string;
  autoApproveMovements: boolean;
  requireIncidentApproval: boolean;
  enableNotifications: boolean;
  defaultLocation: string;
  maxStockPerProduct: number;
}

// DATOS INICIALES
export const SYSTEM_USERS: SystemUser[] = [
  { 
    email: 'admin@almacen.com', 
    password: 'admin123', 
    role: 'admin', 
    name: 'Admin Principal' 
  },
  { 
    email: 'manager@almacen.com', 
    password: 'manager123', 
    role: 'manager', 
    name: 'Manager López' 
  },
  { 
    email: 'operator@almacen.com', 
    password: 'operator123', 
    role: 'operator', 
    name: 'Operador García' 
  },
  { 
    email: 'auditor@almacen.com', 
    password: 'auditor123', 
    role: 'auditor', 
    name: 'Auditor Martínez' 
  },
];

export const INITIAL_PRODUCTS: Product[] = [
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
    name: 'Monitor Dell 27"', 
    category: 'Electrónica', 
    quantity: 8, 
    minStock: 5, 
    price: 329.99, 
    location: 'Pasillo A, Estante 2' 
  },
  { 
    id: '5', 
    name: 'Silla Ergonómica', 
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

export const INITIAL_APP_USERS: AppUser[] = [
  { 
    id: '1', 
    name: 'Admin Principal', 
    email: 'admin@almacen.com', 
    role: 'admin', 
    status: 'active', 
    createdAt: new Date(2025, 0, 1).toISOString() 
  },
  { 
    id: '2', 
    name: 'Manager López', 
    email: 'manager@almacen.com', 
    role: 'manager', 
    status: 'active', 
    createdAt: new Date(2025, 1, 15).toISOString() 
  },
  { 
    id: '3', 
    name: 'Operador García', 
    email: 'operator@almacen.com', 
    role: 'operator', 
    status: 'active', 
    createdAt: new Date(2025, 2, 10).toISOString() 
  },
  { 
    id: '4', 
    name: 'Auditor Martínez', 
    email: 'auditor@almacen.com', 
    role: 'auditor', 
    status: 'active', 
    createdAt: new Date(2025, 3, 5).toISOString() 
  },
  { 
    id: '5', 
    name: 'María González', 
    email: 'maria.gonzalez@almacen.com', 
    role: 'operator', 
    status: 'active', 
    createdAt: new Date(2025, 5, 20).toISOString() 
  }
];

export const DEFAULT_CONFIG: SystemConfig = {
  companyName: 'Almacén Central',
  lowStockThreshold: 20,
  currency: 'USD',
  autoApproveMovements: false,
  requireIncidentApproval: true,
  enableNotifications: true,
  defaultLocation: 'Almacén Principal',
  maxStockPerProduct: 1000
};

// FUNCIONES DE BASE DE DATOS SIMULADA

/**
 * AUTENTICACIÓN
 * TODO: Reemplazar con axios.post('/api/auth/login', { email, password })
 */
export const authenticateUser = (email: string, password: string): SystemUser | null => {
  const user = SYSTEM_USERS.find(u => u.email === email && u.password === password);
  return user || null;
};

/**
 * PRODUCTOS
 * TODO: Reemplazar con llamadas a API
 */
export const loadProducts = (): Product[] => {
  const saved = localStorage.getItem('almacen_products');
  return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem('almacen_products', JSON.stringify(products));
};

export const createProduct = (productData: Omit<Product, 'id'>): Product => {
  const newProduct: Product = { 
    ...productData, 
    id: Date.now().toString() 
  };
  const products = loadProducts();
  saveProducts([...products, newProduct]);
  return newProduct;
};

export const updateProduct = (id: string, productData: Omit<Product, 'id'>): Product | null => {
  const products = loadProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  const updatedProduct: Product = { ...productData, id };
  products[index] = updatedProduct;
  saveProducts(products);
  return updatedProduct;
};

export const deleteProduct = (id: string): boolean => {
  const products = loadProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  
  saveProducts(filtered);
  return true;
};

/**
 * MOVIMIENTOS
 * TODO: Reemplazar con axios.get('/api/movements'), axios.post('/api/movements'), etc.
 */
export const loadMovements = (): Movement[] => {
  const saved = localStorage.getItem('almacen_movements');
  return saved ? JSON.parse(saved) : [];
};

export const saveMovements = (movements: Movement[]): void => {
  localStorage.setItem('almacen_movements', JSON.stringify(movements));
};

export const createMovement = (
  movementData: Omit<Movement, 'id' | 'date' | 'productName' | 'user' | 'status'>,
  userName: string,
  productName: string,
  autoApprove: boolean = false
): Movement => {
  const newMovement: Movement = {
    ...movementData,
    id: Date.now().toString(),
    productName,
    date: new Date().toISOString(),
    user: userName,
    status: autoApprove ? 'aprobado' : 'pendiente'
  };
  
  const movements = loadMovements();
  saveMovements([...movements, newMovement]);
  return newMovement;
};

export const approveMovement = (id: string, reviewerName: string): Movement | null => {
  const movements = loadMovements();
  const index = movements.findIndex(m => m.id === id);
  if (index === -1) return null;
  
  movements[index] = {
    ...movements[index],
    status: 'aprobado',
    reviewedBy: reviewerName,
    reviewedAt: new Date().toISOString()
  };
  
  saveMovements(movements);
  return movements[index];
};

export const rejectMovement = (id: string, reviewerName: string): Movement | null => {
  const movements = loadMovements();
  const index = movements.findIndex(m => m.id === id);
  if (index === -1) return null;
  
  movements[index] = {
    ...movements[index],
    status: 'rechazado',
    reviewedBy: reviewerName,
    reviewedAt: new Date().toISOString()
  };
  
  saveMovements(movements);
  return movements[index];
};

/**
 * INCIDENCIAS
 * TODO: Reemplazar con llamadas a API
 */
export const loadIncidents = (): Incident[] => {
  const saved = localStorage.getItem('almacen_incidents');
  return saved ? JSON.parse(saved) : [];
};

export const saveIncidents = (incidents: Incident[]): void => {
  localStorage.setItem('almacen_incidents', JSON.stringify(incidents));
};

export const createIncident = (
  incidentData: Omit<Incident, 'id' | 'reportedAt' | 'reportedBy' | 'status'>,
  reporterName: string,
  productName: string
): Incident => {
  const newIncident: Incident = {
    ...incidentData,
    id: Date.now().toString(),
    productName,
    reportedBy: reporterName,
    reportedAt: new Date().toISOString(),
    status: 'pendiente'
  };
  
  const incidents = loadIncidents();
  saveIncidents([...incidents, newIncident]);
  return newIncident;
};

export const resolveIncident = (
  id: string, 
  status: 'resuelto' | 'rechazado', 
  resolverName: string
): Incident | null => {
  const incidents = loadIncidents();
  const index = incidents.findIndex(i => i.id === id);
  if (index === -1) return null;
  
  incidents[index] = {
    ...incidents[index],
    status,
    resolvedBy: resolverName,
    resolvedAt: new Date().toISOString()
  };
  
  saveIncidents(incidents);
  return incidents[index];
};

/**
 * USUARIOS DE LA APLICACIÓN
 * TODO: Reemplazar con llamadas a API
 */
export const loadAppUsers = (): AppUser[] => {
  const saved = localStorage.getItem('almacen_app_users');
  return saved ? JSON.parse(saved) : INITIAL_APP_USERS;
};

export const saveAppUsers = (users: AppUser[]): void => {
  localStorage.setItem('almacen_app_users', JSON.stringify(users));
};

export const createAppUser = (userData: Omit<AppUser, 'id' | 'createdAt'>): AppUser => {
  const newUser: AppUser = { 
    ...userData, 
    id: Date.now().toString(), 
    createdAt: new Date().toISOString() 
  };
  
  const users = loadAppUsers();
  saveAppUsers([...users, newUser]);
  return newUser;
};

export const updateAppUser = (id: string, userData: Omit<AppUser, 'id' | 'createdAt'>): AppUser | null => {
  const users = loadAppUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  
  const updatedUser: AppUser = { 
    ...userData, 
    id, 
    createdAt: users[index].createdAt 
  };
  users[index] = updatedUser;
  saveAppUsers(users);
  return updatedUser;
};

export const deleteAppUser = (id: string): boolean => {
  const users = loadAppUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  
  saveAppUsers(filtered);
  return true;
};

/**
 * CONFIGURACIÓN DEL SISTEMA
 * TODO: Reemplazar con llamadas a API
 */
export const loadSystemConfig = (): SystemConfig => {
  const saved = localStorage.getItem('almacen_config');
  return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
};

export const saveSystemConfig = (config: SystemConfig): void => {
  localStorage.setItem('almacen_config', JSON.stringify(config));
};

/**
 * USUARIO ACTUAL
 */
export const saveCurrentUser = (user: { email: string; role: string; name: string }): void => {
  localStorage.setItem('almacen_current_user', JSON.stringify(user));
};

export const loadCurrentUser = (): { email: string; role: string; name: string } | null => {
  const saved = localStorage.getItem('almacen_current_user');
  return saved ? JSON.parse(saved) : null;
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem('almacen_current_user');
};
