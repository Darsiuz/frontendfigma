import type { View } from '@type/View';
import type { AppUser } from '@type/User';
import { VIEWS_CONFIG } from '@utils/views.config';
import { canAccessView } from '@utils/sidebar.permissions';

const ALL_ROLES: AppUser['role'][] = [
  'admin',
  'manager',
  'operator',
  'auditor',
];

export const getAccessibleViewsForRole = (role: AppUser['role']) => {
  const fakeUser = { role } as AppUser;

  return VIEWS_CONFIG
    .filter(view => canAccessView(fakeUser, view.id as View))
    .map(view => view.label);
};

export const ALL_ROLES_LIST = ALL_ROLES;