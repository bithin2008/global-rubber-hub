import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'intro',
    loadComponent: () => import('./intro/intro.page').then((m) => m.IntroPage),
  },
  {
    path: '',
    redirectTo: 'intro',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.page').then( m => m.ForgotPasswordPage)
  },
];
