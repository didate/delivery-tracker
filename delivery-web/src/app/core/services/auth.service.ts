import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse, RegisterRequest, RefreshTokenRequest } from '../models';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'current_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  // Reactive state using signals
  private readonly currentUserSignal = signal<User | null>(this.loadUserFromStorage());
  private readonly isAuthenticatedSignal = signal<boolean>(this.hasValidToken());

  // Public computed signals for consumers
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);

  login(email: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return of({} as LoginResponse);
    }

    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<LoginResponse>(`${this.baseUrl}/refresh`, request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  isUserAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSignal();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSignal();
    return user ? roles.includes(user.role) : false;
  }

  private handleAuthResponse(response: LoginResponse): void {
    if (response.accessToken) {
      localStorage.setItem(TOKEN_KEY, response.accessToken);
    }
    if (response.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }
    if (response.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      this.currentUserSignal.set(response.user);
    }
    this.isAuthenticatedSignal.set(true);
  }

  private loadUserFromStorage(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch {
        return null;
      }
    }
    return null;
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    return !!token;
  }
}
