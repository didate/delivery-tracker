export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER';
