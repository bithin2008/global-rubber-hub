import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: localStorage.getItem('has_intro') == 'yes' ? 'login' : 'intro',
    pathMatch: 'full',
  },
  {
    path: 'intro',
    loadComponent: () => import('./intro/intro.page').then((m) => m.IntroPage),
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
  {
    path: 'trusted-seller',
    loadComponent: () => import('./trusted-seller/trusted-seller.page').then( m => m.TrustedSellerPage)
  },
  {
    path: 'verify-now',
    loadComponent: () => import('./verify-now/verify-now.page').then( m => m.VerifyNowPage)
  },
  {
    path: 'verify-inner',
    loadComponent: () => import('./verify-inner/verify-inner.page').then( m => m.VerifyInnerPage)
  },
  {
    path: 'notification',
    loadComponent: () => import('./notification/notification.page').then( m => m.NotificationPage)
  },
  {
    path: 'gst-udyam-verification',
    loadComponent: () => import('./gst-udyam-verification/gst-udyam-verification.page').then( m => m.GstUdyamVerificationPage)
  },
  {
    path: 'deep-link-demo',
    loadComponent: () => import('./components/deep-link-demo/deep-link-demo.component').then( m => m.DeepLinkDemoComponent)
  },
];
