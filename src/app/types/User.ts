export type UserRole = 'admin' | 'manager' | 'operator' | 'auditor';
export type UserStatus = 'active' | 'inactive';

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

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}