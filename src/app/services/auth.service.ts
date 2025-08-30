import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { authConfig } from '../config/auth.config';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { DeepLinkService } from './deep-link.service';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

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
    // Initialize Google Auth
    if (this.platform.is('android')) {
      GoogleAuth.initialize();
    }
  }

  /**
   * Sign in with Google using native Android integration
   */
  async signInWithGoogle(retryCount = 0): Promise<any> {
    try {
      // Maximum retry attempts
      const MAX_RETRIES = 3;
      
      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      // Clear any existing tokens
    //  await GoogleAuth.signOut();
      
      // Small delay before sign-in attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get user info from Google
      const googleUser = await GoogleAuth.signIn();
      
      if (!googleUser) {
        throw new Error('Failed to get user information from Google');
      }
      
      // Send to backend for authentication/registration
      const data = {
        email: googleUser.email,
        google_id: googleUser.id,
        first_name: googleUser.givenName,
        last_name: googleUser.familyName,
        full_name: googleUser.name,
        photo_url: googleUser.imageUrl
      };

      // Call your backend API
      return this.http.post(environment.API_ENDPOINT + 'auth/google-login', data)
        .pipe(catchError(this.handleError))
        .toPromise();
        
    } catch (error: any) {
      console.error('Error during Google sign in:', error);
      
      // Handle network errors with retry mechanism
      if (error.name === 'NetworkError' && retryCount < 3) {
        console.log(`Retrying Google Sign-in (Attempt ${retryCount + 1} of 3)`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        return this.signInWithGoogle(retryCount + 1);
      }
      
      // If we've exhausted retries or it's a different error, throw it
      throw error;
    }
  }

  /**
   * Sign in with Google using native Android integration
   */
  

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
