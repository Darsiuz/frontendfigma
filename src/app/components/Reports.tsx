import { useState } from 'react';
import { Download, FileText, TrendingUp, Package, DollarSign, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';

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

interface ReportsProps {
  products: Product[];
  movements: Movement[];
}

export function Reports({ products, movements }: ReportsProps) {
  const [reportType, setReportType] = useState('inventory');
  const [dateRange, setDateRange] = useState('month');

  // Cálculos de reportes
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.quantity <= p.minStock).length;

  // Productos por categoría
  const categoryReport = products.reduce((acc: any[], product) => {
    const existing = acc.find(item => item.category === product.category);
    if (existing) {
      existing.products += 1;
      existing.units += product.quantity;
      existing.value += product.quantity * product.price;
    } else {
      acc.push({
        category: product.category,
        products: 1,
        units: product.quantity,
        value: product.quantity * product.price
      });
    }
    return acc;
  }, []);

  // Movimientos por mes
  const monthlyMovements = movements.reduce((acc: any[], mov) => {
    const date = new Date(mov.date);
    const monthYear = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
    const existing = acc.find(item => item.month === monthYear);
    
    if (existing) {
      if (mov.type === 'entrada') {
        existing.entradas += mov.quantity;
      } else {
        existing.salidas += mov.quantity;
      }
    } else {
      acc.push({
        month: monthYear,
        entradas: mov.type === 'entrada' ? mov.quantity : 0,
        salidas: mov.type === 'salida' ? mov.quantity : 0
      });
    }
    return acc;
  }, []);

  // Top 10 productos más movidos
  const productMovements = movements.reduce((acc: any, mov) => {
    if (!acc[mov.productId]) {
      acc[mov.productId] = {
        name: mov.productName,
        totalMovements: 0,
        entradas: 0,
        salidas: 0
      };
    }
    acc[mov.productId].totalMovements += mov.quantity;
    if (mov.type === 'entrada') {
      acc[mov.productId].entradas += mov.quantity;
    } else {
      acc[mov.productId].salidas += mov.quantity;
    }
    return acc;
  }, {});

  const topProducts = Object.values(productMovements)
    .sort((a: any, b: any) => b.totalMovements - a.totalMovements)
    .slice(0, 10);

  // Valor del inventario en el tiempo (simulado)
  const inventoryValueOverTime = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      month: date.toLocaleDateString('es-ES', { month: 'short' }),
      value: totalValue * (0.8 + Math.random() * 0.4)
    };
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const exportReport = (type: string) => {
    let csvContent = '';
    let filename = '';

    if (type === 'inventory') {
      csvContent = [
        ['Producto', 'Categoría', 'Cantidad', 'Stock Mínimo', 'Precio', 'Valor Total', 'Ubicación'].join(','),
        ...products.map(p => [
          `"${p.name}"`,
          `"${p.category}"`,
          p.quantity,
          p.minStock,
          p.price,
          p.quantity * p.price,
          `"${p.location}"`
        ].join(','))
      ].join('\n');
      filename = `reporte_inventario_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'movements') {
      csvContent = [
        ['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Motivo', 'Usuario'].join(','),
        ...movements.map(m => [
          new Date(m.date).toLocaleDateString('es-ES'),
          `"${m.productName}"`,
          m.type === 'entrada' ? 'Entrada' : 'Salida',
          m.quantity,
          `"${m.reason}"`,
          `"${m.user}"`
        ].join(','))
      ].join('\n');
      filename = `reporte_movimientos_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'categories') {
      csvContent = [
        ['Categoría', 'Productos', 'Unidades', 'Valor Total'].join(','),
        ...categoryReport.map(c => [
          `"${c.category}"`,
          c.products,
          c.units,
          c.value
        ].join(','))
      ].join('\n');
      filename = `reporte_categorias_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
          <p className="text-gray-600 mt-1">Análisis y estadísticas del sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportReport('inventory')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Inventario
          </button>
          <button
            onClick={() => exportReport('movements')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Movimientos
          </button>
          <button
            onClick={() => exportReport('categories')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Categorías
          </button>
        </div>
      </div>

      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90">Total Productos</p>
          <p className="text-3xl font-bold mt-1">{totalProducts}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90">Valor Total</p>
          <p className="text-3xl font-bold mt-1">${totalValue.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90">Stock Bajo</p>
          <p className="text-3xl font-bold mt-1">{lowStockCount}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-90">Movimientos</p>
          <p className="text-3xl font-bold mt-1">{movements.length}</p>
        </div>
      </div>

      {/* Gráficos de análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movimientos mensuales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Movimientos por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyMovements}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="entradas" stroke="#10b981" name="Entradas" strokeWidth={2} />
              <Line type="monotone" dataKey="salidas" stroke="#ef4444" name="Salidas" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Valor por categoría */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Valor por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryReport}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, value }) => `${category}: $${value.toLocaleString()}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryReport.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Valor del inventario en el tiempo */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Valor del Inventario (12 meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={inventoryValueOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Valor Total" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top productos más movidos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Productos Más Movidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="totalMovements" fill="#3b82f6" name="Total Movimientos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de reporte por categorías */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Reporte Detallado por Categoría</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Unidades</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% del Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryReport.map((category, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-gray-900">{category.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {category.products}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {category.units.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${category.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {((category.value / totalValue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-4 font-semibold text-gray-900">Total</td>
                <td className="px-6 py-4 font-semibold text-gray-900">{totalProducts}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {products.reduce((sum, p) => sum + p.quantity, 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  ${totalValue.toLocaleString()}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Productos con stock bajo */}
      {lowStockCount > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Productos con Stock Bajo</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Mínimo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diferencia</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products
                  .filter(p => p.quantity <= p.minStock)
                  .map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.minStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {product.quantity - product.minStock}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
