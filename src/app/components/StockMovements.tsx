import { useState } from 'react';
import { Plus, ArrowUpCircle, ArrowDownCircle, X, Calendar, Filter, Download, Activity } from 'lucide-react';

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
  role: 'admin' | 'manager' | 'operator' | 'auditor';
  name: string;
}

interface StockMovementsProps {
  products: Product[];
  movements: Movement[];
  onAddMovement: (movement: Omit<Movement, 'id' | 'date' | 'productName' | 'user'>) => void;
  user: User;
}

export function StockMovements({ products, movements, onAddMovement, user }: StockMovementsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'entrada' as 'entrada' | 'salida',
    quantity: 0,
    reason: '',
  });
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const canEdit = user.role === 'admin' || user.role === 'manager';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.productId && formData.quantity > 0) {
      onAddMovement(formData);
      setFormData({
        productId: '',
        type: 'entrada',
        quantity: 0,
        reason: '',
      });
      setIsModalOpen(false);
    }
  };

  const filteredMovements = movements.filter(movement => {
    const matchesType = typeFilter === 'all' || movement.type === typeFilter;
    const matchesSearch = movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const movDate = new Date(movement.date);
      const today = new Date();
      
      if (dateFilter === 'today') {
        matchesDate = movDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = movDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = movDate >= monthAgo;
      }
    }
    
    return matchesType && matchesDate && matchesSearch;
  });

  const sortedMovements = [...filteredMovements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalEntradas = filteredMovements
    .filter(m => m.type === 'entrada')
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalSalidas = filteredMovements
    .filter(m => m.type === 'salida')
    .reduce((sum, m) => sum + m.quantity, 0);

  const exportToCSV = () => {
    const headers = ['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Motivo', 'Usuario'];
    const rows = sortedMovements.map(m => [
      new Date(m.date).toLocaleDateString('es-ES'),
      m.productName,
      m.type === 'entrada' ? 'Entrada' : 'Salida',
      m.quantity,
      m.reason,
      m.user
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `movimientos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Movimientos de Stock</h2>
          <p className="text-gray-600 mt-1">Registro de entradas y salidas de inventario</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar
          </button>
          {canEdit && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Movimiento
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Movimientos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filteredMovements.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Entradas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">+{totalEntradas.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Salidas</p>
          <p className="text-2xl font-bold text-red-600 mt-1">-{totalSalidas.toLocaleString()}</p>
        </div>
      </div>

      {/* Lista de movimientos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sortedMovements.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay movimientos que mostrar</p>
            {canEdit && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Registrar el primer movimiento
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedMovements.map(movement => (
              <div key={movement.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`rounded-full p-2 mt-1 ${
                      movement.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {movement.type === 'entrada' ? (
                        <ArrowUpCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{movement.productName}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          movement.type === 'entrada' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{movement.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(movement.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>Por: {movement.user}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                    </p>
                    <p className="text-xs text-gray-500">unidades</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de nuevo movimiento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Registrar Movimiento</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto *
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock actual: {product.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Movimiento *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'entrada' })}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition-all ${
                      formData.type === 'entrada'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowUpCircle className="w-5 h-5" />
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'salida' })}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition-all ${
                      formData.type === 'salida'
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowDownCircle className="w-5 h-5" />
                    Salida
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo *
                </label>
                <textarea
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Ej: Compra a proveedor, Venta a cliente, Ajuste de inventario..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}