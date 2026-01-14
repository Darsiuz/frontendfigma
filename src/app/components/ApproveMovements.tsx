import { useState } from 'react';
import { Clock, CheckCircle, XCircle, ArrowUpCircle, ArrowDownCircle, Filter } from 'lucide-react';

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

interface ApproveMovementsProps {
  movements: Movement[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ApproveMovements({ movements, onApprove, onReject }: ApproveMovementsProps) {
  const [filter, setFilter] = useState('pendiente');

  const filteredMovements = movements.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const sortedMovements = [...filteredMovements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const pendingCount = movements.filter(m => m.status === 'pendiente').length;
  const approvedCount = movements.filter(m => m.status === 'aprobado').length;
  const rejectedCount = movements.filter(m => m.status === 'rechazado').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Aprobar Movimientos de Stock</h2>
        <p className="text-gray-600 mt-1">Revise y apruebe los movimientos de inventario</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pendiente')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pendiente'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('aprobado')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'aprobado'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Aprobados ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('rechazado')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'rechazado'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rechazados ({rejectedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pendientes de Aprobación</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Aprobados</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Rechazados</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Lista de movimientos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sortedMovements.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {filter === 'pendiente' 
                ? 'No hay movimientos pendientes de aprobación'
                : 'No hay movimientos con este estado'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedMovements.map(movement => (
              <div key={movement.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`rounded-full p-3 ${
                      movement.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {movement.type === 'entrada' ? (
                        <ArrowUpCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{movement.productName}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          movement.type === 'entrada' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          movement.status === 'pendiente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : movement.status === 'aprobado'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {movement.status === 'pendiente' ? 'Pendiente' : 
                           movement.status === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{movement.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(movement.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span>Por: {movement.user}</span>
                        <span className={`font-medium ${
                          movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'entrada' ? '+' : '-'}{movement.quantity} unidades
                        </span>
                      </div>
                      {movement.reviewedBy && (
                        <p className="text-xs text-gray-500 mt-2">
                          Revisado por: {movement.reviewedBy} el {new Date(movement.reviewedAt!).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>
                  {movement.status === 'pendiente' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove(movement.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprobar
                      </button>
                      <button
                        onClick={() => onReject(movement.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
    </div>
  );
}
