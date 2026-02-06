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
  email: string;
  password: string;
  name: string;
  tenantId?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
