import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser, toggleUser } from "@services/user.service";
import { Plus, Edit, Trash2, X, Shield, Mail, User as UserIcon, Check } from 'lucide-react';
import type { AppUser, ApiUser } from '@type/User';
import { getAccessibleViewsForRole, ALL_ROLES_LIST } from '@utils/roleDescriptions';
import { toast } from "sonner";
import { ALL_ROLES, ROLE_CONFIG } from "@utils/role.config";
import { Input } from "./forms/Input";
import { FormField } from "./forms/FormField";
import { Select } from "./forms/Select";

export function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const mapApiUserToAppUser = (apiUser: ApiUser): AppUser => ({
    id: apiUser.id.toString(),
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role.name.toLowerCase() as AppUser["role"],
    status: (apiUser.active ? "active" : "inactive") as AppUser["status"],
    createdAt: apiUser.createdAt,
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers();

        setUsers(data.map(mapApiUserToAppUser));
      } catch (e) {
        console.error("Error cargando usuarios", e);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator' as 'admin' | 'manager' | 'operator' | 'auditor',
    status: 'active' as 'active' | 'inactive',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      status: 'active',
    });
    setEditingUser(null);
  };

  const handleEdit = (user: AppUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleUser = async (id: string, active: boolean) => {
    try {
      await toggleUser(Number(id), active);
      setUsers(users.map(u => u.id === id ? { ...u, status: active ? 'active' : 'inactive' } : u));
      toast.info(`Usuario ${active ? 'activado' : 'desactivado'} correctamente`);
    } catch (e) {
      toast.error("Error actualizando estado del usuario");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(Number(id));
      setUsers(users.filter(u => u.id !== id));
    } catch (e) {
      console.error("Error eliminando usuario", e);
      toast.error("Error eliminando usuario");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(Number(editingUser.id), {
          name: formData.name,
          email: formData.email,
          role: formData.role.toUpperCase(),
          active: formData.status === 'active',
          ...(formData.password && { password: formData.password })
        });
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role.toUpperCase(),
          active: formData.status === 'active',
        });
      }
      setIsModalOpen(false);
      resetForm();
      toast.success(`Usuario ${editingUser ? 'actualizado' : 'creado'} correctamente`);
      // recargar lista
      const refreshed = await getUsers();
      setUsers(refreshed.map(mapApiUserToAppUser));
    } catch (e) {
      console.error("Error guardando usuario", e);
      toast.error("Error al guardar usuario");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-600 mt-1">Administre usuarios y permisos del sistema</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
          <p className="text-sm text-gray-600">Total Usuarios</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
        </div>
        {ALL_ROLES.map(role => (
          <div key={role} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">
              {ROLE_CONFIG[role].label}
            </p>
            <p className="text-2xl font-bold mt-1">
              {users.filter(u => u.role === role).length}
            </p>
          </div>
        ))}
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${ROLE_CONFIG[user.role].color}`}>
                      {ROLE_CONFIG[user.role].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleToggleUser(user.id, user.status === 'inactive')}
                      className="text-gray-600 hover:text-gray-900 mr-3"
                      title={user.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'}
                    >
                      {user.status === 'active' ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Está seguro de eliminar al usuario "${user.name}"?`)) {
                          handleDeleteUser(user.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información de permisos por rol */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 `}>
        {ALL_ROLES_LIST.map(role => (
          <div key={role} className={`${ROLE_CONFIG[role].color} rounded-lg shadow p-6`}>
            <div className={`flex items-center gap-2 mb-4 ${ROLE_CONFIG[role].color.split(' ')[1]}`}>
              <Shield className={`w-5 h-5`} />
              <h3 className={`font-semibold capitalize`}>
                {ROLE_CONFIG[role].label}
              </h3>
            </div>

            <ul className="space-y-2">
              {getAccessibleViewsForRole(role).map((label, index) => (
                <li
                  key={index}
                  className={`text-sm flex items-center gap-2 ${ROLE_CONFIG[role].color.split(' ')[1]}`}
                >
                  <div className={`w-1.5 h-1.5 ${ROLE_CONFIG[role].color.split(' ')[0]} rounded-full `} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="h-12" />

      {/* Modal de formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4" autoComplete="off">
              <FormField label="Nombre Completo *">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input type="text" required placeholder="Juan Pérez" className=" pl-10 "
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormField>

              <FormField label="Correo Electrónico *">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input type="email" required placeholder="usuario@ejemplo.com" className=" pl-10 " autoComplete="new-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </FormField>

              <FormField label={editingUser ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña *"}>
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input type="password" required={!editingUser} className=" pl-10 " autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? "Dejar en blanco para no cambiar" : "Contraseña"}
                />
              </FormField>

              <FormField label="Rol *">
                <Select required value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} >
                  {ALL_ROLES.map(role => (
                    <option key={role} value={role}>{ROLE_CONFIG[role].label}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Estado">
                <Select value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </Select>
              </FormField>

              <div className="flex gap-3 pt-4">
                <button type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >Cancelar
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >{editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}