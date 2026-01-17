import { useState } from 'react';
import { AlertTriangle, Plus, X, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  location: string;
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
  role: 'admin' | 'manager' | 'operator' | 'auditor';
  name: string;
}

interface IncidentManagementProps {
  products: Product[];
  incidents: Incident[];
  onAddIncident: (incident: Omit<Incident, 'id' | 'reportedAt' | 'reportedBy' | 'status'>) => void;
  onResolveIncident: (id: string, status: 'resuelto' | 'rechazado') => void;
  user: User;
}

export function IncidentManagement({ products, incidents, onAddIncident, onResolveIncident, user }: IncidentManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    productId: '',
    type: 'daño' as 'daño' | 'pérdida' | 'robo' | 'vencimiento' | 'otro',
    quantity: 0,
    description: '',
  });

  const canCreateIncident = user.role === 'operator' || user.role === 'manager' || user.role === 'admin';
  const canResolveIncident = user.role === 'manager' || user.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.productId && formData.quantity > 0 && formData.description) {
      onAddIncident(formData);
      setFormData({
        productId: '',
        type: 'daño',
        quantity: 0,
        description: '',
      });
      setIsModalOpen(false);
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (statusFilter === 'all') return true;
    return incident.status === statusFilter;
  });

  const sortedIncidents = [...filteredIncidents].sort((a, b) => 
    new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
  );

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      daño: 'Daño',
      pérdida: 'Pérdida',
      robo: 'Robo',
      vencimiento: 'Vencimiento',
      otro: 'Otro'
    };
    return labels[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      daño: 'bg-orange-100 text-orange-800',
      pérdida: 'bg-yellow-100 text-yellow-800',
      robo: 'bg-red-100 text-red-800',
      vencimiento: 'bg-purple-100 text-purple-800',
      otro: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      resuelto: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user.role === 'operator' ? 'Registrar Incidencias' : 'Gestión de Incidencias'}
          </h2>
          <p className="text-gray-600 mt-1">
            {user.role === 'operator' 
              ? 'Reporte problemas y anomalías en el inventario'
              : 'Gestione y resuelva incidencias del inventario'}
          </p>
        </div>
        {canCreateIncident && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Incidencia
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setStatusFilter('pendiente')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'pendiente'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setStatusFilter('resuelto')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'resuelto'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Resueltas
          </button>
          <button
            onClick={() => setStatusFilter('rechazado')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'rechazado'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rechazadas
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Incidencias</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{incidents.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {incidents.filter(i => i.status === 'pendiente').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Resueltas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {incidents.filter(i => i.status === 'resuelto').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Unidades Afectadas</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {incidents.reduce((sum, i) => sum + i.quantity, 0)}
          </p>
        </div>
      </div>

      {/* Lista de incidencias */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sortedIncidents.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay incidencias registradas</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedIncidents.map(incident => (
              <div key={incident.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-orange-100 rounded-full p-3">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{incident.productName}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(incident.type)}`}>
                          {getTypeLabel(incident.type)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(incident.status)}`}>
                          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(incident.reportedAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>Reportado por: {incident.reportedBy}</span>
                        <span className="font-medium text-orange-600">{incident.quantity} unidades afectadas</span>
                      </div>
                      {incident.resolvedBy && (
                        <p className="text-xs text-gray-500 mt-2">
                          Resuelto por: {incident.resolvedBy} el {new Date(incident.resolvedAt!).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>
                  {canResolveIncident && incident.status === 'pendiente' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onResolveIncident(incident.id, 'resuelto')}
                        className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolver
                      </button>
                      <button
                        onClick={() => onResolveIncident(incident.id, 'rechazado')}
                        className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de nueva incidencia */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Registrar Incidencia</h2>
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
                  Producto Afectado *
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {product.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Incidencia *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="daño">Daño en producto</option>
                  <option value="pérdida">Pérdida</option>
                  <option value="robo">Robo</option>
                  <option value="vencimiento">Vencimiento</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad Afectada *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción Detallada *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={4}
                  placeholder="Describa detalladamente el incidente, cuándo ocurrió y las circunstancias..."
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
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Registrar Incidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
