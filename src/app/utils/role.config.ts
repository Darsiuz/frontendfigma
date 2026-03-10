import type { UserRole } from '@type/User';

export const ROLE_CONFIG: Record<UserRole, {
  label: string;
  color: string;
}> = {
  admin: {
    label: 'Administrador',
    color: 'bg-purple-100 text-purple-800',
  },
  manager: {
    label: 'Gerente',
    color: 'bg-blue-100 text-blue-800',
  },
  operator: {
    label: 'Operador',
    color: 'bg-green-100 text-green-800',
  },
  auditor: {
    label: 'Auditor',
    color: 'bg-gray-100 text-gray-800',
  },
};

export const ALL_ROLES = Object.keys(ROLE_CONFIG) as UserRole[];