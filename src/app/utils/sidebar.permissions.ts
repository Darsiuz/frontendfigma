import type { User as U } from '@type/User';
import type { View } from '@type/View';
import { ADMIN, MANAGER, OPERATOR, AUDITOR } from '@utils/permissions';

// ACA SE DEFINE QUIEN PUEDE VER CADA ITEM DEL SIDEBAR, ESTO SE HACE EN BASE AL ROL DEL USUARIO
export const canAccessView = (u: U, view: View): boolean => {
  switch (view) {
    // Dashboard
    case 'dashboard':
      return ADMIN(u) || MANAGER(u) || OPERATOR(u);

    // Admin
    case 'inventory':
    case 'users':
    case 'settings':
    case 'reports':
      return ADMIN(u);

    // Manager
    case 'supervise':
    case 'manager-reports':
      return MANAGER(u);

    case 'approve':
      return ADMIN(u) || MANAGER(u);

    case 'incidents':
      return MANAGER(u);

    // Operator
    case 'register-movements':
    case 'consult-inventory':
    case 'report-incident':
      return OPERATOR(u);

    // Auditor
    case 'audit-inventory':
    case 'audit-movements':
    case 'audit-reports':
      return AUDITOR(u);

    default:
      return false;
  }
};
