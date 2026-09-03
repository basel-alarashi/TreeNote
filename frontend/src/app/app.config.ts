import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/http/error.interceptor';
import { authInterceptor } from './core/auth/auth.interceptor';
import {
  SocialLoginModule,
  SOCIAL_AUTH_CONFIG,
  SocialAuthServiceConfig,
  GoogleLoginProvider
} from '@abacritt/angularx-social-login';
import { environment } from '../environments/environment';
import { SyncService } from './services/offline/sync.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])),
    importProvidersFrom(SocialLoginModule),
    provideAppInitializer(() => {
      inject(SyncService);
    }),
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.googleClientId)
          }
        ]
      } as SocialAuthServiceConfig
    }
  ]
};
