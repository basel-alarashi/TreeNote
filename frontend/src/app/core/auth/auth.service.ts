import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';
import {
  AuthResult,
  CurrentUser,
  GoogleLoginRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest
} from './auth.models';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { OfflineStorageService } from '../../services/offline-storage.service';

interface JwtPayload {
  sub: string;
  email: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<CurrentUser | null>(null);

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService,
    private readonly offlineStorage: OfflineStorageService,
    private readonly router: Router,
    private readonly socialAuthService: SocialAuthService
  ) {
    this.restoreSession();
  }

  register(request: RegisterRequest): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${environment.apiUrl}/auth/register`, request)
      .pipe(tap((result) => this.handleAuthResult(result)));
  }

  login(request: LoginRequest): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap((result) => this.handleAuthResult(result)));
  }

  loginWithGoogle(request: GoogleLoginRequest): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${environment.apiUrl}/auth/google`, request)
      .pipe(tap((result) => this.handleAuthResult(result)));
  }

  refreshToken(): Observable<AuthResult | null> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return of(null);
    }

    const body: RefreshTokenRequest = { refreshToken };

    return this.http.post<AuthResult>(`${environment.apiUrl}/auth/refresh`, body).pipe(
      tap((result) => this.handleAuthResult(result)),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  logout(): void {
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (refreshToken) {
      this.http
        .post(`${environment.apiUrl}/auth/logout`, { refreshToken })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }

    this.clearSession();

    // Tear down Google's client-side session too — otherwise authState
    // keeps replaying the last signed-in user, silently re-authenticating
    // the moment /login re-subscribes to it.
    this.socialAuthService.signOut().catch(() => {
      // No-op: throws if the user never had a Google session this visit.
    });

    this.offlineStorage.clearAllLocalData();

    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  getCurrentUserId(): string | null {
    return this.currentUser()?.userId ?? null;
  }

  /** Restores session on app startup from a persisted refresh token. */
  private restoreSession(): void {
    const accessToken = this.tokenStorage.getAccessToken();
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (!refreshToken) {
      return;
    }

    if (accessToken && !this.isExpired(accessToken)) {
      this.setCurrentUserFromToken(accessToken);
      return;
    }

    // Access token missing/expired but we have a refresh token — try silently.
    this.refreshToken().subscribe();
  }

  private handleAuthResult(result: AuthResult): void {
    this.tokenStorage.setTokens(result.accessToken, result.refreshToken);
    this.currentUserSignal.set({ userId: result.userId, email: result.email });
  }

  private clearSession(): void {
    this.tokenStorage.clear();
    this.currentUserSignal.set(null);
  }

  private setCurrentUserFromToken(accessToken: string): void {
    const payload = jwtDecode<JwtPayload>(accessToken);
    this.currentUserSignal.set({ userId: payload.sub, email: payload.email });
  }

  private isExpired(accessToken: string): boolean {
    try {
      const payload = jwtDecode<JwtPayload>(accessToken);
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}
