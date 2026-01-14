export type UserRole = 'admin' | 'manager' | 'operator' | 'auditor';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}