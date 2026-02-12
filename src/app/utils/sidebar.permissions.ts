import type { User } from '@/app/types/User';
import type { View } from '@/app/types/View';


// Permisos de VISTA / ROL
export const canAccessView = (user: User, view: View): boolean => {
  switch (view) {
    // Dashboard
    case 'dashboard':
      // return true; // esto es que es visto por todos
      return user.role === 'admin' || user.role === 'manager' || user.role === 'operator';

    // Admin
    case 'inventory':
    case 'users':
    case 'settings':
    case 'reports':
      return user.role === 'admin';

    // Manager
    case 'supervise':
    case 'manager-reports':
      return user.role === 'manager';

    case 'approve':
      return user.role === 'admin' || user.role === 'manager';

    case 'incidents':
      return user.role === 'manager';

    // Operator
    case 'register-entry':
    case 'register-exit':
    case 'consult-inventory':
    case 'report-incident':
      return user.role === 'operator';

    // Auditor
    case 'audit-inventory':
    case 'audit-movements':
    case 'audit-reports':
    case 'export-audit':
      return user.role === 'auditor';

    default:
      return false;
  }
};
