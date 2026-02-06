import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface RegisterRequest {
  tenantName: string;
  tenantCode: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
