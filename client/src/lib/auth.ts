import { apiRequest } from './queryClient';
import type { User, LoginRequest, RegisterRequest } from '@shared/schema';

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: Omit<User, 'password'> | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    const data: AuthResponse = await response.json();
    
    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('auth_token', data.token);
    
    return data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    const data: AuthResponse = await response.json();
    
    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('auth_token', data.token);
    
    return data;
  }

  async getCurrentUser(): Promise<Omit<User, 'password'> | null> {
    if (!this.token) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const data = await response.json();
      this.user = data.user;
      return data.user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): Omit<User, 'password'> | null {
    return this.user;
  }
}

export const authService = AuthService.getInstance();
