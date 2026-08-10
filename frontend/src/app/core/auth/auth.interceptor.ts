import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

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

      // Access token likely expired mid-session — try one silent refresh.
      return authService.refreshToken().pipe(
        switchMap((result) => {
          if (!result) {
            authService.logout();
            return throwError(() => error);
          }

          const retriedReq = req.clone({
            setHeaders: { Authorization: `Bearer ${result.accessToken}` }
          });
          return next(retriedReq);
        })
      );
    })
  );
};
