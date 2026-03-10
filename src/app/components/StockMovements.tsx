import { useState } from 'react';
import { Plus, ArrowUpCircle, ArrowDownCircle, X, Calendar, Download, Activity } from 'lucide-react';
import { type Movement, MovementStatus, MovementType } from '@type/Movement';
import { canApproveMovement, canCreateMovement } from '@utils/permissions';
import { useAppContext } from '@context/AppContext';
import { FormField } from './forms/FormField';
import { Select } from './forms/Select';
import { Input } from './forms/Input';

interface StockMovementsProps {
  onAddMovement: (movement: Omit<Movement, 'id' | 'date' | 'productName' | 'user' | 'status'>) => void;
}

export function StockMovements({ onAddMovement }: StockMovementsProps) {
  const { currentUser: user, products, movements: mm } = useAppContext();
  const movements = !canCreateMovement(user) && !canApproveMovement(user) ? mm.filter(m => m.status === MovementStatus.APROBADO) : mm;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: 0,
    type: MovementType.ENTRADA as MovementType.ENTRADA | MovementType.SALIDA,
    quantity: 0,
    reason: '',
  });
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const canCreate = canCreateMovement(user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.productId && formData.quantity > 0) {
      onAddMovement(formData);
      setFormData({
        productId: 0,
        type: MovementType.ENTRADA,
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
    .filter(m => m.type === MovementType.ENTRADA)
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalSalidas = filteredMovements
    .filter(m => m.type === MovementType.SALIDA)
    .reduce((sum, m) => sum + m.quantity, 0);

  const exportToCSV = () => {
    const headers = ['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Motivo', 'Usuario'];
    const rows = sortedMovements.map(m => [
      new Date(m.date).toLocaleDateString('es-ES'),
      m.productName,
      m.type === MovementType.ENTRADA ? 'Entrada' : 'Salida',
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
          {canCreate && (
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
            <Input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Todos los tipos</option>
            <option value={MovementType.ENTRADA}>Entradas</option>
            <option value={MovementType.SALIDA}>Salidas</option>
          </Select>
          <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </Select>
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
            {canCreate && (
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
                    <div className={`rounded-full p-2 mt-1 ${movement.type === MovementType.ENTRADA ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                      {movement.type === MovementType.ENTRADA ? (
                        <ArrowUpCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{movement.productName}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${movement.type === MovementType.ENTRADA
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {movement.type === MovementType.ENTRADA ? 'Entrada' : 'Salida'}
                        </span>
                        {movement.status && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${movement.status === MovementStatus.PENDIENTE
                            ? 'bg-yellow-100 text-yellow-800'
                            : movement.status === MovementStatus.APROBADO
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {movement.status === MovementStatus.PENDIENTE ? 'Pendiente' :
                              movement.status === MovementStatus.APROBADO ? 'Aprobado' : 'Rechazado'}
                          </span>
                        )}
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
                      {movement.reviewedBy && (
                        <p className="text-xs text-gray-500 mt-2">
                          Revisado por: {movement.reviewedBy} el {new Date(movement.reviewedAt!).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${movement.type === MovementType.ENTRADA ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {movement.type === MovementType.ENTRADA ? '+' : '-'}{movement.quantity}
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
              <FormField label="Producto *">
                <Select required value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: Number(e.target.value) })} >
                  <option value={0}>Seleccionar producto...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock actual: {product.quantity})
                    </option>
                  ))}
                </Select>
              </FormField>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Movimiento *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: MovementType.ENTRADA })}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition-all ${formData.type === MovementType.ENTRADA
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <ArrowUpCircle className="w-5 h-5" />
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: MovementType.SALIDA })}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition-all ${formData.type === MovementType.SALIDA
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <ArrowDownCircle className="w-5 h-5" />
                    Salida
                  </button>
                </div>
              </div>

              <FormField label="Cantidad *">
                <Input type="number" required min="1" placeholder="0" value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </FormField>

              <FormField label="Motivo *">
                <textarea required value={formData.reason} rows={3}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Compra a proveedor, Venta a cliente, Ajuste de inventario..."
                />
              </FormField>

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