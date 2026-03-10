import type { User } from '@type/User';
import type { View } from '@type/View';

export const getDefaultViewByRole = (user: User): View => {
  switch (user.role) {
    case 'admin':
      return 'dashboard';

    case 'manager':
      return 'dashboard';

    case 'operator':
      return 'dashboard';

    case 'auditor':
      return 'audit-reports';

    default:
      return 'dashboard';
  }
};