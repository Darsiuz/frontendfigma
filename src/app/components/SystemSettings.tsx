import { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import type { SystemConfig } from '@type/SystemConfig';
import { toast } from "sonner";
import { useAppContext } from '@context/AppContext';

interface SystemSettingsProps {
  onSave: (config: SystemConfig) => void;
}

export function SystemSettings({ onSave }: SystemSettingsProps) {
  const { systemConfig: config } = useAppContext();
  const [formData, setFormData] = useState<SystemConfig | null>(config);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  useEffect(() => {
    const isDifferent = JSON.stringify(formData) !== JSON.stringify(config);
    setHasChanges(isDifferent);
  }, [formData, config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;

    onSave(formData);
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData(config);
    setHasChanges(false);
  };

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500">Cargando configuracion del sistema...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
        <p className="text-gray-600 mt-1">Ajuste los parámetros generales del almacén</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuración General */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Información General</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={formData.companyName ?? ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <select
                value={formData.currency ?? ''}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="PEN">PEN (S/)</option>
                <option value="EUR">EUR (€)</option>
                <option value="MXN">MXN ($)</option>
                <option value="COP">COP ($)</option>
                <option value="ARS">ARS ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación Predeterminada
              </label>
              <input
                type="text"
                value={formData.defaultLocation}
                onChange={(e) => setFormData({ ...formData, defaultLocation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Almacén Principal"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Flujos de Trabajo */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Flujos de Trabajo</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="autoApprove"
                checked={formData.autoApproveMovements}
                onChange={(e) => setFormData({ ...formData, autoApproveMovements: e.target.checked })}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="autoApprove" className="font-medium text-gray-900 cursor-pointer">
                  Aprobar movimientos automáticamente
                </label>
                <p className="text-sm text-gray-600">
                  Los movimientos de stock se aprobarán sin revisión del Manager
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="requireApproval"
                checked={formData.requireIncidentApproval}
                onChange={(e) => setFormData({ ...formData, requireIncidentApproval: e.target.checked })}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="requireApproval" className="font-medium text-gray-900 cursor-pointer">
                  Requerir aprobación de incidencias
                </label>
                <p className="text-sm text-gray-600">
                  Las incidencias deben ser aprobadas por un Manager antes de ajustar el stock
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="notifications"
                checked={formData.enableNotifications}
                onChange={(e) => setFormData({ ...formData, enableNotifications: e.target.checked })}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="notifications" className="font-medium text-gray-900 cursor-pointer">
                  Habilitar notificaciones
                </label>
                <p className="text-sm text-gray-600">
                  Recibir alertas de stock bajo, movimientos pendientes e incidencias
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Información del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-blue-700">Versión del Sistema</p>
              <p className="font-medium text-blue-900">v{__APP_VERSION__}</p>
            </div>
            <div>
              <p className="text-blue-700">Última Actualización</p>
              <p className="font-medium text-blue-900">{new Date(__BUILD_DATE__).toLocaleDateString('es-ES')}</p>
            </div>
            <div>
              <p className="text-blue-700">Licencia</p>
              <p className="font-medium text-blue-900">{__APP_LICENSE__}</p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              handleReset();
              toast('Cambios restablecidos', { icon: '🔄' });
            }}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-5 h-5" />
            Restablecer
          </button>
          <button
            type="submit"
            disabled={!hasChanges}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            Guardar Configuración
          </button>
        </div>

        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Hay cambios sin guardar. Haz clic en "Guardar Configuracion" para aplicar los cambios.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
