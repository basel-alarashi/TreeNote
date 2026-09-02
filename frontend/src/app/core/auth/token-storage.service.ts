import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly accessToken = signal<string | null>(null);

  getAccessToken(): string | null {
    return this.accessToken();
  }

  setAccessToken(token: string): void {
    this.accessToken.set(token);
  }

  clear(): void {
    this.accessToken.set(null);
  }
}
