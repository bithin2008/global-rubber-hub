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
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'forgot-password-otp',
    loadComponent: () => import('./forgot-password-otp/forgot-password-otp.page').then( m => m.ForgotPasswordOtpPage)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password/reset-password.page').then( m => m.ResetPasswordPage)
  },
  {
    path: 'account',
    loadComponent: () => import('./account/account.page').then( m => m.AccountPage)
  },
  {
    path: 'item-list',
    loadComponent: () => import('./item-list/item-list.page').then( m => m.ItemListPage)
  },
  {
    path: 'item-add',
    loadComponent: () => import('./item-add/item-add.page').then( m => m.ItemAddPage)
  },
  {
    path: 'my-item',
    loadComponent: () => import('./my-item/my-item.page').then( m => m.MyItemPage)
  },
  {
    path: 'bid-history',
    loadComponent: () => import('./bid-history/bid-history.page').then( m => m.BidHistoryPage)
  },
  {
    path: 'bid-request',
    loadComponent: () => import('./bid-request/bid-request.page').then( m => m.BidRequestPage)
  },
];
