import { Package, TrendingUp, AlertTriangle, Activity, DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

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

interface DashboardViewProps {
  products: Product[];
  movements: Movement[];
}

export function DashboardView({ products, movements }: DashboardViewProps) {
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const lowStockProducts = products.filter(p => p.quantity <= p.minStock).length;
  
  const todayMovements = movements.filter(m => {
    const today = new Date();
    const movDate = new Date(m.date);
    return movDate.toDateString() === today.toDateString();
  }).length;

  // Datos para gráfico de categorías
  const categoryData = products.reduce((acc: any[], product) => {
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value += product.quantity;
      existing.totalValue += product.quantity * product.price;
    } else {
      acc.push({ 
        name: product.category, 
        value: product.quantity,
        totalValue: product.quantity * product.price
      });
    }
    return acc;
  }, []);

  // Movimientos de los últimos 7 días
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const movementsByDay = last7Days.map(date => {
    const dayMovements = movements.filter(m => {
      const movDate = new Date(m.date);
      return movDate.toDateString() === date.toDateString();
    });

    return {
      date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      entradas: dayMovements.filter(m => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0),
      salidas: dayMovements.filter(m => m.type === 'salida').reduce((sum, m) => sum + m.quantity, 0)
    };
  });

  // Top 5 productos más valiosos
  const topProducts = [...products]
    .sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price))
    .slice(0, 5);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const recentMovements = movements.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Productos</p>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
          <p className="text-xs text-gray-500 mt-1">Registrados en sistema</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Unidades</p>
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalUnits.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">En inventario</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Valor Total</p>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Valor del inventario</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Stock Bajo</p>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{lowStockProducts}</p>
          <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Movimientos Hoy</p>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{todayMovements}</p>
          <p className="text-xs text-gray-500 mt-1">Registrados hoy</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movimientos por día */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Movimientos de los Últimos 7 Días</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={movementsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
              <Bar dataKey="salidas" fill="#ef4444" name="Salidas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inventario por categoría */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 productos más valiosos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos de Mayor Valor</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${(product.quantity * product.price).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{product.quantity} unidades</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Movimientos recientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {recentMovements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay movimientos recientes</p>
            ) : (
              recentMovements.map(movement => (
                <div key={movement.id} className="flex items-start gap-3 p-3 border-b border-gray-100 last:border-b-0">
                  <div className={`rounded-full p-2 ${
                    movement.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {movement.type === 'entrada' ? (
                      <ArrowUpCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{movement.productName}</p>
                    <p className="text-sm text-gray-500">{movement.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Por {movement.user} • {new Date(movement.date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <p className={`font-semibold ${
                    movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alertas de stock bajo */}
      {lowStockProducts > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">
                Alerta: {lowStockProducts} {lowStockProducts === 1 ? 'producto tiene' : 'productos tienen'} stock bajo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {products
                  .filter(p => p.quantity <= p.minStock)
                  .map(product => (
                    <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded border border-orange-200">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-orange-600">
                          Stock: {product.quantity}
                        </p>
                        <p className="text-xs text-gray-500">Mín: {product.minStock}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
