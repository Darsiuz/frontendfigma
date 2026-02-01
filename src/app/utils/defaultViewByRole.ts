import type { User } from '@/app/types/User';
import type { View } from '@/app/types/View';

export const getDefaultViewByRole = (user: User): View => {
  switch (user.role) {
    case 'admin':
      return 'dashboard';

    case 'manager':
      return 'dashboard';

    case 'operator':
      return 'dashboard';

    case 'auditor':
      return 'export-audit';

    default:
      return 'dashboard';
  }
};