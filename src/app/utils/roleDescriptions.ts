import type { View } from '@/app/types/View';
import { VIEWS_CONFIG } from '@/app/utils/views.config';
import { canAccessView } from '@/app/utils/sidebar.permissions';
import type { AppUser } from '@/app/types/User';

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