import { User } from '@/app/types/User';

export const canCreateProduct = (user: User) =>
  user.role === 'admin' || user.role === 'manager';

export const canEditProduct = (user: User) =>
  user.role === 'admin' || user.role === 'manager';

export const canDeleteProduct = (user: User) =>
  user.role === 'admin';



export const canCreateMovement = (user: User) =>
  user.role === 'admin' || user.role === 'manager' || user.role === 'operator';

export const canApproveMovement = (user: User) =>
  user.role === 'admin' || user.role === 'manager';



export const canCreateIncident = (user: User) =>
  user.role === 'admin' || user.role === 'manager' || user.role === 'operator';

export const canResolveIncident = (user: User) =>
  user.role === 'admin' || user.role === 'manager';

export const canViewReports = (user: User) =>
  user.role === 'admin' || user.role === 'manager';

export const canManageUsers = (user: User) =>
  user.role === 'admin';



export const canViewDashboard = (user: User) =>
  ['admin', 'manager', 'operator', 'viewer'].includes(user.role);

