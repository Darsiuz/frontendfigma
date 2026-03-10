import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Product } from '@type/Product';
import { getCurrencySymbol } from '@utils/currency';
import { useAppContext } from '@context/AppContext';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/forms/Input';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => void;
  editProduct?: Product | null;
  formErrors?: Record<string, string>;
}

export function ProductForm({ isOpen, onClose, onSave, editProduct, formErrors }: ProductFormProps) {
  const { systemConfig } = useAppContext();
  const currencySymbol = getCurrencySymbol(systemConfig?.currency);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    minStock: 0,
    price: 0,
    location: '',
  });

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name,
        category: editProduct.category,
        quantity: editProduct.quantity,
        minStock: editProduct.minStock,
        price: editProduct.price,
        location: editProduct.location,
      });
    } else {
      setFormData({
        name: '',
        category: '',
        quantity: 0,
        minStock: 0,
        price: 0,
        location: '',
      });
    }
  }, [editProduct, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          ><X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField label="Nombre del Producto *" error={formErrors?.name}>
            <Input type="text" required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Laptop HP"
              error={formErrors?.name}
            />
          </FormField>
          <FormField label="Categoría *" error={formErrors?.category}>
            <Input type="text" required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Ej: Electrónica"
              error={formErrors?.category}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Cantidad *" error={formErrors?.quantity}>
              <Input type="number" required min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                error={formErrors?.quantity}
              />
            </FormField>
            <FormField label="Stock Mínimo *" error={formErrors?.minStock}>
              <Input type="number" required min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                error={formErrors?.minStock}
              />
            </FormField>
          </div>
          <FormField label="Precio Unitario *" error={formErrors?.price}>
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">{currencySymbol}</span>
            <Input type="number" required min="0" step="0.01" placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className={`pl-8 pr-3`}
              error={formErrors?.price}
            />
          </FormField>
          <FormField label="Ubicación" error={formErrors?.location}>
            <Input type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ej: Pasillo A, Estante 3"
              error={formErrors?.location}
            />
          </FormField>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >Cancelar
            </button>
            <button type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >{editProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
