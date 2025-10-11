import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';

import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthGuardService } from './auth-guard.service';


@Injectable({
  providedIn: 'root',
})
export class CommonService {
  token: any;
  headersObj: any;
  options: any;
  constructor(
    private _http: HttpClient,
    private authGuardService: AuthGuardService
  ) { }
  getHeader() {
    this.token = localStorage.getItem('token');
    this.headersObj = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', 'Bearer ' + this.token);
    let header = {
      headers: this.headersObj,
    };
    return header;
  }

  getFileHeader() {
    this.token = localStorage.getItem('token');
    this.headersObj = new HttpHeaders()
      .set('Authorization', 'Bearer ' + this.token);
    let header = {
      headers: this.headersObj
    };
    return header;
  }

  headerKeys() {
    this.headersObj = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('username', 'gstsof')
      .set('password', 'Gstsof@2017')
      .set('api_key', '6j2N5vl2HXUam3vKHpmAQTAh95aigL52')
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
      
      // Handle 401 Unauthorized errors globally
      if (error.status === 401) {
        console.log('401 error detected, handling authentication failure');
        this.authGuardService.handle401Error('Session expired. Please login again');
      }
    }
    return throwError('Something bad happened; please try again later.');
  }
  get(url: any): Observable<any> {
    return this._http
      .get(environment.API_ENDPOINT + url, this.getHeader())
      .pipe(catchError(this.handleError));
  }

  fileget(url: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/pdf').set('username', 'gstsof')
      .set('password', 'Gstsof@2017')
      .set('api_key', '6j2N5vl2HXUam3vKHpmAQTAh95aigL52')
      .set('Authorization', 'Bearer ' + this.token);
    return this._http
      .get(environment.API_ENDPOINT + url, { headers, responseType: 'blob' as 'json' })
      .pipe(catchError(this.handleError));
  }



  filepost(url: any, data: any): Observable<any> {
    return this._http
      .post(environment.API_ENDPOINT + url, data, this.getFileHeader())
      .pipe(catchError(this.handleError));
  }

  fileDownload(url: any, data: any): Observable<any> {
    const headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + this.token);
    return this._http
      .post(environment.API_ENDPOINT + url, data, { 
        headers, 
        responseType: 'blob' 
      })
      .pipe(catchError(this.handleError));
  }

  post(url: any, data: any): Observable<any> {
    return this._http
      .post(environment.API_ENDPOINT + url, data, this.getHeader())
      .pipe(catchError(this.handleError));
  }

  delete(url: any): Observable<any> {
    return this._http
      .delete(environment.API_ENDPOINT + url, this.getHeader())
      .pipe(catchError(this.handleError));
  }
  put(url: any, data: any): Observable<any> {
    return this._http
      .put(environment.API_ENDPOINT + url, data, this.getHeader())
      .pipe(catchError(this.handleError));
  }

  login(url: any, data: any) {
    return this._http
      .post(environment.API_ENDPOINT + url, data)
      .pipe(catchError(this.handleError));
  }
  noTokenPost(url: any, data: any) {
    return this._http
      .post(environment.API_ENDPOINT + url, data, this.headerKeys())
      .pipe(catchError(this.handleError));
  }

  noTokenGet(url: any): Observable<any> {
    return this._http
      .get(environment.API_ENDPOINT + url, this.getHeader())
      .pipe(catchError(this.handleError));
  }

  register(url: any, data: any) {
    return this._http
      .post(environment.API_ENDPOINT + url, data)
      .pipe(catchError(this.handleError));
  }

  forgotPassword(url: any) {
    return this._http
      .get(environment.API_ENDPOINT + url)
      .pipe(catchError(this.handleError));
  }
  logout(url: any, data: any): Observable<any> {
    return this._http
      .post(environment.API_ENDPOINT + url, data, this.getHeader())
      .pipe(catchError(this.handleError));
  }

  getLocal(url: any): Observable<any> {
    return this._http
      .get(url)
      .pipe(catchError(this.handleError));
  }
}

