import { Routes } from '@angular/router';
import { ShellComponent } from './layouts/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      // Feature routes (workspaces, auth) added starting Sprint 1's next phase / Sprint 2.
    ],
  },
];
