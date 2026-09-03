import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Subject, catchError, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

// Module-level — shared across every request passing through this interceptor.
let isRefreshing = false;
let refreshTokenSubject = new Subject<string>();

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);

  const accessToken = tokenStorage.getAccessToken();
  const isAuthEndpoint = req.url.includes('/auth/login')
    || req.url.includes('/auth/register')
    || req.url.includes('/auth/google')
    || req.url.includes('/auth/refresh');

  const authorizedReq = accessToken && !isAuthEndpoint
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authorizedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        const currentSubject = refreshTokenSubject;

        return authService.refreshToken().pipe(
          switchMap((result) => {
            isRefreshing = false;
            if (!result) {
              authService.logout();
              currentSubject.error(error);
              refreshTokenSubject = new Subject<string>();
              return throwError(() => error);
            }
            currentSubject.next(result.accessToken);
            currentSubject.complete();
            refreshTokenSubject = new Subject<string>();
            const retriedReq = req.clone({ setHeaders: { Authorization: `Bearer ${result.accessToken}` } });
            return next(retriedReq);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            authService.logout();
            currentSubject.error(refreshError);
            refreshTokenSubject = new Subject<string>();
            return throwError(() => refreshError);
          })
        );
      }

      // A refresh is already in flight for another request — wait for its outcome
      // instead of firing a second /auth/refresh call.
      return refreshTokenSubject.pipe(
        take(1),
        switchMap((token) => {
          const retriedReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
          return next(retriedReq);
        })
      );
    })
  );
};
