export type UserRole = 'admin' | 'manager' | 'operator' | 'auditor';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
  active: boolean;
  createdAt: string;
}