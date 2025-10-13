import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { DeepLinkService } from './deep-link.service';
import { ToastModalComponent } from '../toast-modal/toast-modal.component';
import { AuthGuardService } from './auth-guard.service';

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
    private deepLinkService: DeepLinkService,
    private modalController: ModalController,
    private authGuardService: AuthGuardService
  ) {
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
    let message = 'Something went wrong. Please try again.';

    if (error.error) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        message = error.error;
      } else if (typeof error.error === 'object') {
        if (error.error.message) {
          message = error.error.message;
        } else if (error.message) {
          message = error.message;
        }
      } else if (error.message) {
        message = error.message;
      }
    } else if (error.message) {
      message = error.message;
    }

    // Map common HTTP status codes to friendly messages (fallbacks)
    if (error.status === 0) {
      message = 'Network error. Check your connection.';
    } else if (error.status === 401) {
      // Don't show modal for 401 errors - let auth guard handle them
      console.log('AuthService - 401 error detected, letting auth guard handle it');
      return throwError(() => error);
    } else if (error.status === 403) {
      message = message || 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      message = message || 'Requested resource was not found.';
    } else if (error.status >= 500) {
      message = message || 'Server error. Please try again later.';
    }

    // Show the shared ToastModalComponent instead of a toast
    try {
      // Do not await: we don't want to block the error propagation
      (async () => {
        console.log('AuthService - Creating modal with message:', message);
        const modal = await this.modalController.create({
          component: ToastModalComponent,
          cssClass: 'toast-modal',
          componentProps: {
            status: 'error',
            message: message,
            submessage: '',
            timer: 3000,
            redirect: ''
          }
        });
        console.log('AuthService - Modal created, presenting...');
        await modal.present();
        console.log('AuthService - Modal presented');
      })();
    } catch (error) {
      console.error('AuthService - Failed to create/present modal:', error);
    }

    return throwError(() => error);
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
    // Use auth guard service for consistent logout handling
    this.authGuardService.logoutUser('You have been logged out');
  }

  /**
   * Handle successful login and check for deep link redirects
   */
  handleSuccessfulLogin() {
    // Check if there's a deep link redirect pending
    this.deepLinkService.handlePostLoginRedirect();
  }
}
