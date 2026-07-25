import { Injectable, signal } from '@angular/core';

// Temporary mock authentication. Sprint 4 replaces the internals of this
// service with real login/logout/token handling — nothing that consumes
// AuthService (the guard, the interceptor, components) needs to change.
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Matches MockCurrentUserService.MockUserId on the backend.
  private readonly mockUserId = '11111111-1111-1111-1111-111111111111';

  readonly isAuthenticated = signal(true);
  readonly userId = signal<string | null>(this.mockUserId);

  login(): void {
    this.isAuthenticated.set(true);
    this.userId.set(this.mockUserId);
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.userId.set(null);
  }

  getToken(): string | null {
    return this.isAuthenticated() ? 'mock-token' : null;
  }
}
