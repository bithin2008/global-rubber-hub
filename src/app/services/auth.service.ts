import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { DeepLinkService } from './deep-link.service';

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
