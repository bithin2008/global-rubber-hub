import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: any;
  headersObj: any;
  options: any;
  constructor(
    private http: HttpClient,
    private router:Router
    ) { }

  getHeader() {
    this.token = localStorage.getItem('token');
    this.headersObj = new HttpHeaders()
      .set('username', 'gstsof')
      .set('password', 'Gstsof@2017')
      .set('api_key', '6j2N5vl2HXUam3vKHpmAQTAh95aigL52')
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
      .get(environment.API_ENDPOINT + 'profile', this.getHeader())
      .pipe(catchError(this.handleError));
  }
  logOut(){
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
