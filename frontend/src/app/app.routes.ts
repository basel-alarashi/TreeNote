import { Routes } from '@angular/router';
import { ShellComponent } from './layouts/shell/shell';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'workspaces', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent)
      }
      {
        path: 'workspaces',
        loadComponent: () =>
          import('./pages/workspace-list/workspace-list').then((m) => m.WorkspaceListComponent),
      },
      {
        path: 'workspaces/:workspaceId/canvases',
        loadComponent: () =>
          import('./pages/canvas-list/canvas-list').then((m) => m.CanvasListComponent),
      },
      {
        path: 'workspaces/:workspaceId/canvases/:canvasId',
        loadComponent: () =>
          import('./pages/canvas-detail/canvas-detail').then((m) => m.CanvasDetailComponent),
      },
    ],
  },
];
