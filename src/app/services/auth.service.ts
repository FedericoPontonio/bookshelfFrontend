import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {jwtDecode} from 'jwt-decode';
import { Router } from '@angular/router';

export interface DecodedToken {
  sub: string;
  name?: string;
  exp?: number;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5154/api/Auth/login';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.apiUrl, credentials);
  }

  storeToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const now = Math.floor(Date.now() / 1000);

      if (decoded.exp && decoded.exp > now) {
        return true;
      } else {
        this.logout(); // remove expired token
        return false;
      }
    } catch (e) {
      console.error('Invalid token:', e);
      this.logout();
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
      console.log('Token removed');
    this.router.navigate(['/login']);
  }
  

  getUserInfo(): DecodedToken | null {
    const token = this.getToken();
    if (!token) {
      console.warn('No token found');
      return null;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('Decoded token from AuthService:', decoded);
      return decoded;
    } catch (e) {
      console.error('Failed to decode token', e);
      return null;
    }
  }
}
