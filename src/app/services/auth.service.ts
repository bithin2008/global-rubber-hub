import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Platform, isPlatform } from '@ionic/angular';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { authConfig } from '../config/auth.config';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { DeepLinkService } from './deep-link.service';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// Declare global google for Google Identity Services
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: any;
  headersObj: any;
  options: any;
  user: any;
  constructor(
    private http: HttpClient,
    private router: Router,
    private platform: Platform,
    private deepLinkService: DeepLinkService
  ) {
    this.initializeGoogleAuth();
  }

  private async initializeGoogleAuth() {
    try {
      await this.platform.ready();

      if (isPlatform('android') || isPlatform('capacitor')) {
        // Mobile platforms - use Capacitor Google Auth
        console.log('Initializing Capacitor Google Auth for mobile...');
        await GoogleAuth.initialize({
          clientId: authConfig.googleAuth.androidClientId,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true
        });
      } else {
        // Web platform - Google Identity Services will be loaded via script tag
        console.log('Web platform detected - Google Identity Services will be loaded via script');
        
        // Wait for Google Identity Services to load
        await this.waitForGoogleIdentityServices();
      }
    } catch (error) {
      console.error('Google Auth initialization error:', error);
      this.handleGoogleAuthError(error);
    }
  }

  private waitForGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve) => {
      const checkGoogleIdentityServices = () => {
        if (window.google?.accounts?.oauth2) {
          resolve();
        } else {
          setTimeout(checkGoogleIdentityServices, 100);
        }
      };
      checkGoogleIdentityServices();
    });
  }

  private handleGoogleAuthError(error: any) {
    console.error('Google Auth Error:', error);
    
    // Check for specific error types
    if (error.message?.includes('redirect_uri_mismatch')) {
      const currentUrl = window.location.origin + window.location.pathname;
      console.error(`Redirect URI Mismatch. Please add "${currentUrl}" to the authorized redirect URIs in Google Cloud Console.`);
      throw new Error(`Redirect URI "${currentUrl}" is not authorized. Please contact support.`);
    }
    
    // Handle other common OAuth errors
    const errorMessage = error.message || error.toString();
    if (errorMessage.includes('popup_closed_by_user')) {
      throw new Error('Sign in cancelled by user.');
    } else if (errorMessage.includes('access_denied')) {
      throw new Error('Access denied. Please grant the required permissions.');
    } else if (errorMessage.includes('immediate_failed')) {
      throw new Error('Automatic sign-in failed. Please try signing in manually.');
    }
    
    // Generic error
    throw new Error('Google Sign In failed. Please try again.');
  }

  async googleSignIn(): Promise<any> {
    try {
      console.log('=== GOOGLE SIGN IN STARTED ===');
      console.log('Platform:', isPlatform('android') ? 'Android' : isPlatform('capacitor') ? 'iOS' : 'Web');

      if (isPlatform('android') || isPlatform('capacitor')) {
        // Mobile platforms - use Capacitor Google Auth
        console.log('Using Capacitor Google Auth for mobile...');
        return await this.googleSignInMobile();
      } else {
        // Web platform - use Google Identity Services
        console.log('Using Google Identity Services for web...');
        return await this.googleSignInWeb();
      }
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      throw new Error(error.message || 'Google Sign In failed');
    }
  }

  private async googleSignInMobile(): Promise<any> {
    try {
      // Sign out first to ensure account picker shows
      try {
        await GoogleAuth.signOut();
      } catch (e) {
        // Ignore sign out errors
      }

      // Sign in with account selection
      this.user = await GoogleAuth.signIn();

      if (!this.user || !this.user.email) {
        throw new Error('No user data received from Google Sign In');
      }

      console.log('Mobile Google Sign In successful:', this.user.email);
      return this.user;
    } catch (error: any) {
      console.error('Mobile Google Sign In failed:', error);
      this.handleGoogleAuthError(error);
    }
  }

  private async googleSignInWeb(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // Check if Google Identity Services is loaded
        if (!window.google?.accounts?.oauth2) {
          reject(new Error('Google Identity Services not loaded. Please refresh the page.'));
          return;
        }

        // Get the current URL for redirect validation
        const currentUrl = window.location.origin + window.location.pathname;

        // Initialize the token client
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: authConfig.googleAuth.webClientId,
          scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          prompt: 'select_account', // This forces the account picker to show
          redirect_uri: currentUrl, // Explicitly set the redirect URI
          callback: (response: any) => {
            if (response.error) {
              console.error('Google Identity Services error:', response.error);
              this.handleGoogleAuthError(new Error(response.error));
              return;
            }

            console.log('Google Identity Services response:', response);

            // For web, we get tokens but not full user info
            // We'll create a basic user object and get more info via API if needed
            const user = {
              id: response.access_token.substring(0, 20),
              email: 'google-user@example.com', // Would need separate API call to get email
              displayName: 'Google User',
              givenName: 'Google',
              familyName: 'User',
              imageUrl: '',
              authentication: {
                accessToken: response.access_token,
                idToken: response.id_token || null
              }
            };

            this.user = user;
            console.log('Web Google Sign In successful');
            resolve(user);
          }
        });

        // Request access token with account selection
        client.requestAccessToken({
          prompt: 'select_account'
        });

      } catch (error: any) {
        console.error('Web Google Sign In failed:', error);
        this.handleGoogleAuthError(error);
      }
    });
  }

  getHeader() {
    this.token = localStorage.getItem('token');
    this.headersObj = new HttpHeaders()
      .set('Authorization', 'Bearer ' + this.token);
    let header = {
      headers: this.headersObj,
    };
    return header;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    return throwError('Something bad happened; please try again later.');
  }

  isUserLoggedIn(): boolean {
    if (localStorage.getItem('token') !== null) {
      return true;
    }
    return false;
  }

  checkUserIsLoggedin(): Observable<any> {
    return this.http
      .get(environment.API_ENDPOINT + 'user/profile', this.getHeader())
      .pipe(catchError(this.handleError));
  }
  logOut(){
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  /**
   * Handle successful login and check for deep link redirects
   */
  handleSuccessfulLogin() {
    // Check if there's a deep link redirect pending
    this.deepLinkService.handlePostLoginRedirect();
  }
}
