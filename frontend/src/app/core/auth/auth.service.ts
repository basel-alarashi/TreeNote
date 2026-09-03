import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, shareReplay, finalize, firstValueFrom, BehaviorSubject, filter, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';
import { AuthResult, CurrentUser, GoogleLoginRequest, LoginRequest, RegisterRequest } from './auth.models';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { OfflineStorageService } from '../../services/offline/offline-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<CurrentUser | null>(null);

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  private refreshInProgress$: Observable<AuthResult | null> | null = null;
  private authReady = new BehaviorSubject<boolean>(false);
  readonly authReady$ = this.authReady.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService,
    private readonly offlineStorage: OfflineStorageService,
    private readonly router: Router,
    private readonly socialAuthService: SocialAuthService
  ) { }

  async initializeAuth(): Promise<void> {
    try {
      const result = await firstValueFrom(this.refreshToken());
      if (result) {
        this.authReady.next(true);
      } else {
        // No valid refresh token, but don't redirect yet
        this.authReady.next(true); // Auth check is complete
      }
    } catch (error) {
      // Handle initialization error
      this.authReady.next(true);
    }
  }

  register(request: RegisterRequest): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/auth/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${environment.apiUrl}/auth/login`, request, { withCredentials: true })
      .pipe(tap((result) => this.handleAuthResult(result)));
  }

  loginWithGoogle(request: GoogleLoginRequest): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${environment.apiUrl}/auth/google`, request, { withCredentials: true })
      .pipe(tap((result) => this.handleAuthResult(result)));
  }

  refreshToken(): Observable<AuthResult | null> {
    if (this.refreshInProgress$) {
      return this.refreshInProgress$;
    }

    const request$ = this.http.post<AuthResult>(
      `${environment.apiUrl}/auth/refresh`,
      {},
      {
        withCredentials: true,
        // Add these headers explicitly
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    ).pipe(
      tap((result) => {
        this.handleAuthResult(result);
      }),
      catchError((error) => {
        console.error('Refresh token failed:', error);
        // Don't clear session here, just return null
        return of(null);
      }),
      finalize(() => {
        this.refreshInProgress$ = null;
      }),
      shareReplay(1)
    );

    this.refreshInProgress$ = request$;
    return request$;
  }

  logout(): void {
    this.http
      .post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe();

    this.clearSession();

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

  whenReady(): Promise<boolean> {
    return firstValueFrom(this.authReady$.pipe(
      filter(ready => ready),
      map(() => this.isAuthenticated())
    ));
  }

  private handleAuthResult(result: AuthResult): void {
    this.tokenStorage.setAccessToken(result.accessToken);
    this.currentUserSignal.set({ userId: result.userId, email: result.email });
  }

  private clearSession(): void {
    this.tokenStorage.clear();
    this.currentUserSignal.set(null);
  }
}
